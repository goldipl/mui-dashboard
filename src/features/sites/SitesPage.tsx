import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useState } from 'react';
import { Navigate, Link as RouterLink, useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { StatCard } from '../../components/StatCard';
import { getSite, isSiteId, SITES } from '../../data/sites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { countByStatus, dayLabels, publishedPerDay } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import type { ArticleStatus, Site } from '../../types';
import { formatCompact } from '../../utils/format';
import { STATUS_META } from '../../utils/workflow';
import { ArticlesTable } from '../articles/ArticlesTable';
import { DEFAULT_FILTERS, filterArticles } from '../articles/filterArticles';

const DAYS = 14;
type StatusFilter = ArticleStatus | 'all';

export default function SitesPage() {
  const { siteId } = useParams();
  if (!isSiteId(siteId)) return <Navigate to="/sites/herald" replace />;
  // Key by site so filters reset when switching publications.
  return <SiteView key={siteId} site={getSite(siteId)} />;
}

function SiteView({ site }: { site: Site }) {
  const navigate = useNavigate();
  const { state } = useNewsroom();
  const [now] = useState(() => Date.now());
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  const siteArticles = useMemo(() => state.articles.filter((a) => a.siteId === site.id), [state.articles, site.id]);
  const counts = useMemo(() => countByStatus(siteArticles), [siteArticles]);
  const totalViews = siteArticles.reduce((sum, a) => sum + a.views, 0);
  const perDay = useMemo(() => publishedPerDay(siteArticles, DAYS, now), [siteArticles, now]);
  const labels = useMemo(() => dayLabels(DAYS, now), [now]);

  const categoryCounts = useMemo(
    () => site.categories.map((name) => siteArticles.filter((a) => a.category === name).length),
    [site.categories, siteArticles],
  );

  const visible = useMemo(() => {
    const filtered = filterArticles(siteArticles, { ...DEFAULT_FILTERS, query: debouncedQuery, status });
    return category ? filtered.filter((a) => a.category === category) : filtered;
  }, [siteArticles, debouncedQuery, status, category]);

  return (
    <>
      <PageHeader
        title="Sites"
        subtitle="Articles grouped by publication"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Sites', to: '/sites' }, { label: site.name }]}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} component={RouterLink} to={`/publisher/articles/new?site=${site.id}`}>
            New {site.name} article
          </Button>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Tabs
          value={site.id}
          onChange={(_, value: string) => navigate(`/sites/${value}`)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, '& .MuiTabs-indicator': { bgcolor: site.color, height: 3 } }}
        >
          {SITES.map((item) => (
            <Tab
              key={item.id}
              value={item.id}
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                  <span>{item.name}</span>
                </Stack>
              }
              sx={{ '&.Mui-selected': { color: item.color } }}
            />
          ))}
        </Tabs>
        <Divider />
        <Box sx={{ p: { xs: 2, md: 3 }, background: `linear-gradient(90deg, ${alpha(site.color, 0.12)}, transparent 70%)` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <div>
              <Typography variant="h5" component="h2" sx={{ color: site.color }}>
                {site.name}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{site.description}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">{site.domain}</Typography>
              </Stack>
            </div>
            <Box sx={{ width: { xs: '100%', md: 360 }, height: 90 }}>
              <LineChart
                height={90}
                xAxis={[{ scaleType: 'point', data: labels, position: 'none' }]}
                yAxis={[{ position: 'none' }]}
                series={[{ data: perDay, color: site.color, area: true, showMark: false, label: 'Published' }]}
                hideLegend
                margin={{ top: 8, bottom: 8, left: 0, right: 0 }}
              />
            </Box>
          </Stack>
        </Box>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="All articles" value={siteArticles.length} icon={<ArticleRoundedIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Published" value={counts.published} icon={<PublishedWithChangesRoundedIcon />} color="success" caption={`${counts.scheduled} scheduled`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Drafts & review" value={counts.draft + counts.in_review} icon={<EditNoteRoundedIcon />} color="warning" caption={`${counts.in_review} waiting for review`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total views"
            value={formatCompact(totalViews)}
            icon={<VisibilityRoundedIcon />}
            color="info"
            caption={`${formatCompact(counts.published ? totalViews / counts.published : 0)} per published article`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Categories" subheader="Click to filter" />
            <CardContent sx={{ pt: 0 }}>
              <BarChart
                height={220}
                layout="horizontal"
                yAxis={[{ scaleType: 'band', data: site.categories, width: 90 }]}
                xAxis={[{ tickMinStep: 1 }]}
                series={[{ data: categoryCounts, color: site.color, label: 'Articles' }]}
                borderRadius={4}
                hideLegend
                margin={{ left: 0, right: 12 }}
              />
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                {site.categories.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    onClick={() => setCategory(category === name ? null : name)}
                    color={category === name ? 'primary' : 'default'}
                    variant={category === name ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2, justifyContent: 'space-between' }}>
              <SearchField value={query} onChange={setQuery} placeholder={`Search ${site.name}…`} sx={{ minWidth: 240 }} />
              <ToggleButtonGroup
                size="small"
                exclusive
                value={status}
                onChange={(_, value: StatusFilter | null) => value && setStatus(value)}
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="all">All</ToggleButton>
                {(['published', 'scheduled', 'in_review', 'draft', 'archived'] as ArticleStatus[]).map((s) => (
                  <ToggleButton key={s} value={s}>
                    {STATUS_META[s].label} ({counts[s]})
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
            <Divider />
            <ArticlesTable articles={visible} hideSite height={620} pageSize={10} />
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
