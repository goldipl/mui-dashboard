import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useMemo, useState, type DragEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { SiteChip } from '../../components/Chips';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { CURRENT_USER_ID, SITES } from '../../data/sites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNewsroom } from '../../store/useNewsroom';
import type { ArticleStatus, SiteId } from '../../types';
import { STATUS_META } from '../../utils/workflow';
import { DEFAULT_FILTERS, filterArticles } from '../articles/filterArticles';
import { ScheduleDialog } from './ScheduleDialog';
import { useWorkflow } from './useWorkflow';
import { WorkflowCard } from './WorkflowCard';

const COLUMNS: { status: ArticleStatus; hint: string }[] = [
  { status: 'draft', hint: 'Work in progress' },
  { status: 'in_review', hint: 'Waiting for approval' },
  { status: 'scheduled', hint: 'Queued for publishing' },
  { status: 'published', hint: 'Live in the last 48 hours' },
];

const PUBLISHED_WINDOW_HOURS = 48;

export default function PublisherPage() {
  const theme = useTheme();
  const { state } = useNewsroom();
  const { moveTo, scheduling, confirmSchedule, cancelSchedule } = useWorkflow();
  const [now] = useState(() => Date.now());
  const [siteId, setSiteId] = useState<SiteId | 'all'>('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [dropTarget, setDropTarget] = useState<ArticleStatus | null>(null);

  const filtered = useMemo(
    () =>
      filterArticles(state.articles, {
        ...DEFAULT_FILTERS,
        query: debouncedQuery,
        siteId,
        authorId: onlyMine ? CURRENT_USER_ID : 'all',
      }),
    [state.articles, debouncedQuery, siteId, onlyMine],
  );

  const columns = useMemo(() => {
    const publishedSince = now - PUBLISHED_WINDOW_HOURS * 3_600_000;
    return COLUMNS.map((column) => {
      let items = filtered.filter((a) => a.status === column.status);
      if (column.status === 'published') {
        items = items.filter((a) => a.publishedAt && new Date(a.publishedAt).getTime() >= publishedSince);
        items.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
      } else if (column.status === 'scheduled') {
        items.sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''));
      } else {
        items.sort(
          (a, b) => Number(b.priority === 'breaking') - Number(a.priority === 'breaking') || b.updatedAt.localeCompare(a.updatedAt),
        );
      }
      return { ...column, items };
    });
  }, [filtered, now]);

  const schedule = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => dayjs(now).startOf('day').add(index, 'day'));
    const scheduled = state.articles.filter((a) => a.status === 'scheduled' && a.scheduledAt);
    return days.map((day) => ({
      day,
      items: scheduled
        .filter((a) => dayjs(a.scheduledAt).isSame(day, 'day'))
        .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!)),
    }));
  }, [state.articles, now]);

  const handleDrop = (event: DragEvent, status: ArticleStatus) => {
    event.preventDefault();
    setDropTarget(null);
    const article = state.articles.find((a) => a.id === event.dataTransfer.getData('text/plain'));
    if (article) moveTo(article, status);
  };

  return (
    <>
      <PageHeader
        title="Publisher"
        subtitle="Editorial workflow – drag cards between columns or use the arrows to move articles."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Publisher' }]}
        actions={
          <>
            <Button color="error" variant="outlined" startIcon={<BoltRoundedIcon />} component={RouterLink} to="/publisher/articles/new?priority=breaking">
              Breaking news
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} component={RouterLink} to="/publisher/articles/new">
              New article
            </Button>
          </>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2, alignItems: { md: 'center' } }}>
          <SearchField value={query} onChange={setQuery} placeholder="Filter cards…" sx={{ flex: 1 }} />
          <TextField select label="Site" value={siteId} onChange={(e) => setSiteId(e.target.value as SiteId | 'all')} sx={{ minWidth: 190 }}>
            <MenuItem value="all">All sites</MenuItem>
            {SITES.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel control={<Switch checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />} label="Only my articles" />
        </Stack>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' },
          mb: 3,
        }}
      >
        {columns.map((column) => {
          const meta = STATUS_META[column.status];
          const color = meta.color === 'default' ? theme.palette.text.secondary : theme.palette[meta.color].main;
          const isTarget = dropTarget === column.status;
          return (
            <Box
              key={column.status}
              onDragOver={(event) => {
                event.preventDefault();
                if (dropTarget !== column.status) setDropTarget(column.status);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(event) => handleDrop(event, column.status)}
              sx={{
                borderRadius: 3,
                bgcolor: isTarget ? alpha(color, 0.12) : alpha(theme.palette.text.primary, 0.03),
                border: `1px ${isTarget ? 'dashed' : 'solid'} ${isTarget ? color : theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 320,
                maxHeight: { lg: 'calc(100vh - 260px)' },
                transition: 'background-color .15s',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1.75, pb: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                <Typography sx={{ fontWeight: 700, flex: 1 }}>{meta.label}</Typography>
                <Box sx={{ px: 1, borderRadius: 5, bgcolor: alpha(color, 0.15), color, fontSize: 13, fontWeight: 700 }}>{column.items.length}</Box>
              </Stack>
              <Typography variant="caption" sx={{ px: 1.75, color: 'text.secondary' }}>
                {column.hint}
              </Typography>
              {/* flexShrink: 0 keeps cards at full height – the column scrolls instead of squashing them. */}
              <Stack spacing={1.25} sx={{ p: 1.25, overflowY: 'auto', flex: 1, '& > *': { flexShrink: 0 } }}>
                {column.items.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 4 }}>
                    Drop articles here
                  </Typography>
                ) : (
                  column.items.map((article) => <WorkflowCard key={article.id} article={article} photos={state.photos} onMove={moveTo} />)
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Card>
        <CardHeader title="Publishing schedule" subheader="Scheduled articles for the next 7 days" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, 1fr)' }, borderTop: 1, borderColor: 'divider' }}>
          {schedule.map(({ day, items }, index) => (
            <Box
              key={day.toISOString()}
              sx={{
                p: 1.5,
                minHeight: 120,
                borderRight: { md: index < 6 ? 1 : 0 },
                borderBottom: { xs: index < 6 ? 1 : 0, md: 0 },
                borderColor: 'divider',
                bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              }}
            >
              <Typography variant="overline" sx={{ color: index === 0 ? 'primary.main' : 'text.secondary', lineHeight: 1.5 }}>
                {index === 0 ? 'Today' : day.format('ddd')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                {day.format('MMM D')}
              </Typography>
              <Stack spacing={1}>
                {items.map((article) => (
                  <Box key={article.id}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {dayjs(article.scheduledAt).format('HH:mm')}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to={`/publisher/articles/${article.id}`}
                      underline="hover"
                      color="inherit"
                      sx={{ display: 'block', fontSize: 13, lineHeight: 1.3, mb: 0.5 }}
                    >
                      {article.title}
                    </Link>
                    <SiteChip siteId={article.siteId} short sx={{ height: 20, fontSize: 10.5 }} />
                  </Box>
                ))}
                {items.length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Nothing scheduled
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Box>
        {schedule.every((d) => d.items.length === 0) && <EmptyState title="The schedule is empty" description="Schedule articles from the board or the editor." />}
      </Card>

      <ScheduleDialog
        open={Boolean(scheduling)}
        initialValue={scheduling?.scheduledAt}
        onClose={cancelSchedule}
        onConfirm={confirmSchedule}
      />
    </>
  );
}
