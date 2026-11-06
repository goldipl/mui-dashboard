import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router';
import { PriorityChip, SiteChip } from '../../../components/Chips';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { EmptyState } from '../../../components/EmptyState';
import { PageHeader } from '../../../components/PageHeader';
import { CURRENT_USER_ID, getSite, isSiteId } from '../../../data/sites';
import { useNotify } from '../../../hooks/useNotify';
import type { SaveArticleOptions } from '../../../store/context';
import { applyStatus } from '../../../store/reducer';
import { useNewsroom } from '../../../store/useNewsroom';
import { HEADLINE_FONT } from '../../../theme/theme';
import type { Article, ArticlePriority, ArticleRevision, ArticleStatus } from '../../../types';
import { createEmptyArticle } from '../../../utils/articleFactory';
import { formatDateTime } from '../../../utils/format';
import { blocksToPlainText, slugify } from '../../../utils/text';
import { hasBlockingIssues, STATUS_META, validateForPublish } from '../../../utils/workflow';
import { ScheduleDialog } from '../ScheduleDialog';
import { ArticlePreview } from './ArticlePreview';
import { ArticleSettingsPanel } from './ArticleSettingsPanel';
import { BlockEditor } from './BlockEditor';
import { PublishPanel } from './PublishPanel';
import { RevisionHistory } from './RevisionHistory';
import { SeoPanel } from './SeoPanel';

type EditorTab = 'content' | 'preview' | 'seo' | 'history';

const HEADLINE_RECOMMENDED = 90;
const LEAD_RECOMMENDED = 300;

const STATUS_NOTE: Record<ArticleStatus, string> = {
  draft: 'Moved back to draft',
  in_review: 'Submitted for review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export default function ArticleEditorPage() {
  const { articleId } = useParams();
  const [params] = useSearchParams();
  const { state } = useNewsroom();

  if (articleId) {
    const article = state.articles.find((a) => a.id === articleId);
    if (!article) {
      return (
        <EmptyState
          icon={<ArticleRoundedIcon />}
          titleComponent="h1"
          title="Article not found"
          description="It may have been deleted by another editor."
          action={
            <Button variant="contained" component={RouterLink} to="/articles">
              Back to articles
            </Button>
          }
        />
      );
    }
    return <ArticleEditor key={article.id} isNew={false} createInitial={() => article} />;
  }

  const siteParam = params.get('site') ?? undefined;
  const priorityParam = params.get('priority');
  const priority: ArticlePriority = priorityParam === 'breaking' || priorityParam === 'high' ? priorityParam : 'normal';
  return (
    <ArticleEditor
      key={`new-${params.toString()}`}
      isNew
      createInitial={() =>
        createEmptyArticle({
          siteId: isSiteId(siteParam) ? siteParam : state.profile.defaultSiteId,
          authorId: CURRENT_USER_ID,
          priority,
        })
      }
    />
  );
}

/** Returns true when the revision snapshot differs from the current content. */
function contentChanged(article: Article): boolean {
  const last = article.revisions[0]?.snapshot;
  if (!last) return true;
  return last.title !== article.title || last.lead !== article.lead || JSON.stringify(last.body) !== JSON.stringify(article.body);
}

function hasContent(article: Article): boolean {
  return Boolean(article.title.trim() || article.lead.trim() || blocksToPlainText(article.body).trim());
}

interface ArticleEditorProps {
  isNew: boolean;
  createInitial: () => Article;
}

function ArticleEditor({ isNew, createInitial }: ArticleEditorProps) {
  const navigate = useNavigate();
  const notify = useNotify();
  const { state, actions } = useNewsroom();
  const [draft, setDraft] = useState<Article>(createInitial);
  const [baseline, setBaseline] = useState<Article>(draft);
  const [tab, setTab] = useState<EditorTab>('content');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const skipBlockRef = useRef(false);

  const stored = state.articles.find((a) => a.id === draft.id);
  const dirty = isNew ? hasContent(draft) : JSON.stringify(draft) !== JSON.stringify(baseline);
  const changedElsewhere = !isNew && stored !== undefined && stored.updatedAt !== baseline.updatedAt;
  const site = getSite(draft.siteId);

  const issues = useMemo(
    () => validateForPublish(draft, draft.status === 'scheduled' ? 'scheduled' : 'published'),
    [draft],
  );

  // --- Unsaved changes protection -------------------------------------------------------------
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !skipBlockRef.current && dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // --- Actions ----------------------------------------------------------------------------------
  const update = (changes: Partial<Article>) => setDraft((current) => ({ ...current, ...changes }));

  const persist = (next: Article, options: SaveArticleOptions = {}) => {
    const saved = actions.saveArticle(next, options);
    setDraft(saved);
    setBaseline(saved);
    if (isNew) {
      skipBlockRef.current = true;
      navigate(`/publisher/articles/${saved.id}`, { replace: true });
    }
    return saved;
  };

  const requireHeadline = (): boolean => {
    if (draft.title.trim()) return true;
    setTab('content');
    notify('Add a headline first.', 'error');
    window.setTimeout(() => titleRef.current?.focus(), 0);
    return false;
  };

  const handleSave = () => {
    if (!requireHeadline()) return;
    if (draft.status !== 'draft' && draft.status !== 'archived') {
      const target = draft.status === 'scheduled' ? 'scheduled' : draft.status;
      if (hasBlockingIssues(validateForPublish(draft, target))) {
        notify('This article is not a draft – fix the checklist errors before saving.', 'error');
        return;
      }
    }
    persist(draft, { revisionNote: isNew ? 'First draft' : contentChanged(draft) ? 'Content edited' : undefined });
    notify(isNew ? 'Draft created.' : draft.status === 'published' ? 'Live article updated.' : 'Changes saved.');
  };

  const handleStatus = (target: ArticleStatus) => {
    if (target === 'scheduled') {
      setScheduleOpen(true);
      return;
    }
    if (!requireHeadline()) return;
    if ((target === 'in_review' || target === 'published') && hasBlockingIssues(validateForPublish(draft, target))) {
      notify('Fix the errors in the publishing checklist first.', 'error');
      return;
    }
    const next = applyStatus(draft, target, new Date().toISOString());
    persist(next, { revisionNote: STATUS_NOTE[target], activityMessage: `${STATUS_NOTE[target]}: “${draft.title}”` });
    notify(`Article moved to “${STATUS_META[target].label}”.`);
  };

  const handleSchedule = (iso: string) => {
    const candidate: Article = { ...draft, scheduledAt: iso };
    const errors = validateForPublish(candidate, 'scheduled');
    if (hasBlockingIssues(errors)) {
      notify(errors.find((e) => e.severity === 'error')?.message ?? 'Cannot schedule.', 'error');
      return;
    }
    persist(
      { ...candidate, status: 'scheduled' },
      { revisionNote: `Scheduled for ${formatDateTime(iso)}`, activityMessage: `Scheduled “${draft.title}” for ${formatDateTime(iso)}` },
    );
    setScheduleOpen(false);
    notify(`Scheduled for ${formatDateTime(iso)}.`);
  };

  const handleRestore = (revision: ArticleRevision) => {
    update({ ...revision.snapshot });
    setTab('content');
    notify('Revision restored in the editor – save to keep it.', 'info');
  };

  // Ctrl/Cmd + S saves the article.
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const slugPlaceholder = slugify(draft.title) || 'article-slug';

  return (
    <>
      <PageHeader
        title={isNew ? (draft.priority === 'breaking' ? 'Breaking news' : 'New article') : 'Edit article'}
        subtitle={
          <Stack component="span" direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
            <SiteChip siteId={draft.siteId} component="span" />
            {draft.priority !== 'normal' && <PriorityChip priority={draft.priority} component="span" />}
            {dirty && <Chip label="Unsaved changes" size="small" color="warning" variant="outlined" component="span" />}
            <span>Press Ctrl + S to save</span>
          </Stack>
        }
        breadcrumbs={[{ label: 'Publisher', to: '/publisher' }, { label: isNew ? 'New article' : draft.title || 'Untitled' }]}
        actions={
          <>
            <Button variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setTab('preview')}>
              Preview
            </Button>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave} disabled={draft.status === 'archived'}>
              Save
            </Button>
          </>
        }
      />

      {changedElsewhere && stored && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setDraft(stored);
                setBaseline(stored);
              }}
            >
              Load latest
            </Button>
          }
        >
          This article was changed outside the editor (now “{STATUS_META[stored.status].label}”). Load the latest version to avoid overwriting it.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <Tabs value={tab} onChange={(_, value: EditorTab) => setTab(value)} variant="scrollable" sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tab value="content" label="Content" />
              <Tab value="preview" label="Preview" />
              <Tab
                value="seo"
                label={
                  <Badge color="warning" variant="dot" invisible={!issues.some((i) => i.field === 'seo')}>
                    SEO & social
                  </Badge>
                }
              />
              <Tab value="history" label={`History (${draft.revisions.length})`} />
            </Tabs>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {tab === 'content' && (
                <Stack spacing={2.5}>
                  <Box>
                    <InputBase
                      inputRef={titleRef}
                      value={draft.title}
                      onChange={(e) => {
                        const title = e.target.value.replace(/\n/g, ' ');
                        setDraft((d) => ({
                          ...d,
                          title,
                          // Keep the slug in sync until the article goes live or the slug is edited manually.
                          slug: d.status !== 'published' && (!d.slug || d.slug === slugify(d.title)) ? slugify(title) : d.slug,
                        }));
                      }}
                      placeholder="Headline"
                      multiline
                      fullWidth
                      autoFocus={isNew}
                      sx={{ fontFamily: HEADLINE_FONT, fontSize: { xs: 26, md: 32 }, fontWeight: 900, lineHeight: 1.25 }}
                      inputProps={{ 'aria-label': 'Headline' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: draft.title.length > HEADLINE_RECOMMENDED ? 'warning.main' : 'text.secondary' }}
                    >
                      {draft.title.length}/{HEADLINE_RECOMMENDED} characters recommended
                    </Typography>
                  </Box>

                  <TextField
                    label="URL slug"
                    value={draft.slug}
                    placeholder={slugPlaceholder}
                    onChange={(e) => update({ slug: slugify(e.target.value) })}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                            {site.domain}/{slugify(draft.category)}/
                          </InputAdornment>
                        ),
                      },
                    }}
                    helperText={draft.status === 'published' ? 'Changing the slug of a live article breaks existing links.' : ' '}
                  />

                  <TextField
                    label="Lead"
                    value={draft.lead}
                    onChange={(e) => update({ lead: e.target.value })}
                    multiline
                    minRows={2}
                    fullWidth
                    placeholder="One or two sentences that summarise the story."
                    helperText={`${draft.lead.length}/${LEAD_RECOMMENDED} characters recommended`}
                    slotProps={{ htmlInput: { style: { fontSize: 17, lineHeight: 1.6 } } }}
                  />

                  <Divider textAlign="left">
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                      Body
                    </Typography>
                  </Divider>

                  <BlockEditor blocks={draft.body} onChange={(body) => update({ body })} />
                </Stack>
              )}
              {tab === 'preview' && <ArticlePreview article={draft} />}
              {tab === 'seo' && <SeoPanel article={draft} onChange={(seo) => update({ seo })} />}
              {tab === 'history' && <RevisionHistory article={draft} onRestore={handleRestore} />}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <PublishPanel
              article={draft}
              isNew={isNew}
              dirty={dirty}
              issues={issues}
              onSave={handleSave}
              onStatus={handleStatus}
              onSchedule={() => (requireHeadline() ? setScheduleOpen(true) : undefined)}
              onDuplicate={() => {
                const copy = actions.duplicateArticle(draft.id);
                if (copy) {
                  notify('Copy created as a new draft.');
                  navigate(`/publisher/articles/${copy.id}`);
                }
              }}
              onDelete={() => setDeleteOpen(true)}
            />
            <ArticleSettingsPanel article={draft} onChange={update} />
          </Stack>
        </Grid>
      </Grid>

      <ScheduleDialog open={scheduleOpen} initialValue={draft.scheduledAt} onClose={() => setScheduleOpen(false)} onConfirm={handleSchedule} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this article?"
        description="The article and all its revisions will be permanently removed."
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          skipBlockRef.current = true;
          navigate('/articles');
          actions.deleteArticles([draft.id]);
          notify('Article deleted.');
        }}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        description="You have unsaved changes in this article. They will be lost if you leave the editor."
        confirmLabel="Leave"
        cancelLabel="Stay"
        destructive
        closeOnConfirm={false}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
    </>
  );
}
