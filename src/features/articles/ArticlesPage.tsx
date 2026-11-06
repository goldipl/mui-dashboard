import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { AUTHORS, SITES } from '../../data/sites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNotify } from '../../hooks/useNotify';
import { countByStatus } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import type { ArticlePriority, ArticleStatus, SiteId } from '../../types';
import { canTransition, PRIORITY_META, STATUS_META, STATUS_ORDER } from '../../utils/workflow';
import { ArticlesTable } from './ArticlesTable';
import { articlesToCsv, DEFAULT_FILTERS, filterArticles, type ArticleFilters } from './filterArticles';

function readFilters(params: URLSearchParams): ArticleFilters {
  return {
    query: params.get('q') ?? '',
    status: (params.get('status') as ArticleStatus | null) ?? 'all',
    siteId: (params.get('site') as SiteId | null) ?? 'all',
    authorId: params.get('author') ?? 'all',
    priority: (params.get('priority') as ArticlePriority | null) ?? 'all',
  };
}

const PARAM_NAMES: Record<keyof ArticleFilters, string> = {
  query: 'q',
  status: 'status',
  siteId: 'site',
  authorId: 'author',
  priority: 'priority',
};

const BULK_ACTIONS: { status: ArticleStatus; label: string; icon: ReactNode }[] = [
  { status: 'in_review', label: 'Send to review', icon: <RateReviewRoundedIcon /> },
  { status: 'published', label: 'Publish', icon: <PublishRoundedIcon /> },
  { status: 'draft', label: 'Move to drafts', icon: <EditNoteRoundedIcon /> },
  { status: 'archived', label: 'Archive', icon: <ArchiveRoundedIcon /> },
];

export default function ArticlesPage() {
  const { state, actions } = useNewsroom();
  const notify = useNotify();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [queryInput, setQueryInput] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  const debouncedQuery = useDebouncedValue(queryInput, 250);
  const [selection, setSelection] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The query can also change from outside (global search in the top bar).
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    if (filters.query !== debouncedQuery) setQueryInput(filters.query);
  }

  // Write the debounced search phrase to the URL so filtered views can be shared.
  useEffect(() => {
    setParams(
      (prev) => {
        if ((prev.get('q') ?? '') === debouncedQuery) return prev;
        const next = new URLSearchParams(prev);
        if (debouncedQuery) next.set('q', debouncedQuery);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [debouncedQuery, setParams]);

  const effectiveFilters = useMemo(() => ({ ...filters, query: debouncedQuery }), [filters, debouncedQuery]);

  const updateFilter = <K extends keyof ArticleFilters>(key: K, value: ArticleFilters[K]) => {
    const next = new URLSearchParams(params);
    if (value === DEFAULT_FILTERS[key] || value === '') next.delete(PARAM_NAMES[key]);
    else next.set(PARAM_NAMES[key], String(value));
    setParams(next, { replace: true });
    setSelection([]);
  };

  const statusCounts = useMemo(
    () => countByStatus(filterArticles(state.articles, effectiveFilters, ['status'])),
    [state.articles, effectiveFilters],
  );
  const filtered = useMemo(() => filterArticles(state.articles, effectiveFilters), [state.articles, effectiveFilters]);
  const totalForTabs = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
  const hasFilters = (Object.keys(DEFAULT_FILTERS) as (keyof ArticleFilters)[]).some(
    (key) => key !== 'status' && effectiveFilters[key] !== DEFAULT_FILTERS[key],
  );

  const selectedArticles = state.articles.filter((article) => selection.includes(article.id));

  const applyBulkStatus = (status: ArticleStatus) => {
    const allowed = selectedArticles.filter((article) => canTransition(article.status, status)).map((a) => a.id);
    if (allowed.length === 0) {
      notify(`None of the selected articles can be moved to “${STATUS_META[status].label}”.`, 'warning');
      return;
    }
    actions.setArticleStatus(allowed, status);
    const skipped = selection.length - allowed.length;
    notify(
      `${allowed.length} article${allowed.length > 1 ? 's' : ''} moved to “${STATUS_META[status].label}”${skipped ? ` (${skipped} skipped)` : ''}.`,
    );
    setSelection([]);
  };

  const exportCsv = () => {
    const blob = new Blob([articlesToCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `articles-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filtered.length} articles.`);
  };

  return (
    <>
      <PageHeader
        title="Articles"
        subtitle={`${state.articles.length} articles across ${SITES.length} sites`}
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Articles' }]}
        actions={
          <>
            <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={exportCsv} disabled={filtered.length === 0}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} component={RouterLink} to="/publisher/articles/new">
              New article
            </Button>
          </>
        }
      />

      <Card>
        <Tabs
          value={filters.status}
          onChange={(_, value: ArticleFilters['status']) => updateFilter('status', value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="all" label={`All (${totalForTabs})`} />
          {STATUS_ORDER.map((status) => (
            <Tab key={status} value={status} label={`${STATUS_META[status].label} (${statusCounts[status]})`} />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <SearchField
            value={queryInput}
            onChange={setQueryInput}
            placeholder="Search headline, tag, author…"
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Site"
              value={filters.siteId}
              onChange={(event) => updateFilter('siteId', event.target.value as ArticleFilters['siteId'])}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All sites</MenuItem>
              {SITES.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Author"
              value={filters.authorId}
              onChange={(event) => updateFilter('authorId', event.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All authors</MenuItem>
              {AUTHORS.map((author) => (
                <MenuItem key={author.id} value={author.id}>
                  {author.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              value={filters.priority}
              onChange={(event) => updateFilter('priority', event.target.value as ArticleFilters['priority'])}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">Any priority</MenuItem>
              {(Object.keys(PRIORITY_META) as ArticlePriority[]).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </MenuItem>
              ))}
            </TextField>
            {hasFilters && (
              <Button
                color="inherit"
                startIcon={<FilterAltOffRoundedIcon />}
                onClick={() => {
                  setQueryInput('');
                  setParams(filters.status === 'all' ? {} : { status: filters.status }, { replace: true });
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>

        {selection.length > 0 && (
          <Alert
            severity="info"
            icon={false}
            sx={{ mx: 2, mb: 2, alignItems: 'center', '& .MuiAlert-message': { width: '100%' } }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
              <strong>{selection.length} selected</strong>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, '& > *': { m: '0 !important' } }}>
                {BULK_ACTIONS.map((action) => (
                  <Button key={action.status} size="small" startIcon={action.icon} onClick={() => applyBulkStatus(action.status)}>
                    {action.label}
                  </Button>
                ))}
                <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Alert>
        )}

        <Divider />
        <ArticlesTable articles={filtered} checkboxSelection selection={selection} onSelectionChange={setSelection} height={720} />
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selection.length} article${selection.length > 1 ? 's' : ''}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteArticles(selection);
          notify(`${selection.length} article${selection.length > 1 ? 's' : ''} deleted.`);
          setSelection([]);
        }}
      />
    </>
  );
}
