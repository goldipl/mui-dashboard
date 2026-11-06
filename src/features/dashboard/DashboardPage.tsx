import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useState, type ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { SITES } from '../../data/sites';
import { countBySite, countByStatus, dayLabels, publishedPerDay, startOfDay } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import { formatCompact, formatDate, formatRelative } from '../../utils/format';
import { ActivityFeed } from './ActivityFeed';
import { EditorialQueue } from './EditorialQueue';
import { MediaSummary } from './MediaSummary';
import { SiteShareChart } from './SiteShareChart';
import { TopArticles } from './TopArticles';

const DAY = 86_400_000;
const CHART_DAYS = 14;

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { state } = useNewsroom();
  const [now] = useState(() => Date.now());
  const { articles } = state;

  const stats = useMemo(() => {
    const today = startOfDay(now);
    const perDay = publishedPerDay(articles, CHART_DAYS, now);
    const statusCounts = countByStatus(articles);
    const inLastDays = (from: number, to: number) =>
      articles.filter((a) => a.publishedAt && new Date(a.publishedAt).getTime() >= from && new Date(a.publishedAt).getTime() < to);
    const viewsThisWeek = inLastDays(now - 7 * DAY, now + DAY).reduce((sum, a) => sum + a.views, 0);
    const viewsPrevWeek = inLastDays(now - 14 * DAY, now - 7 * DAY).reduce((sum, a) => sum + a.views, 0);
    const reviewQueue = articles.filter((a) => a.status === 'in_review');
    const oldestReview = reviewQueue.reduce<string | undefined>(
      (oldest, a) => (!oldest || a.updatedAt < oldest ? a.updatedAt : oldest),
      undefined,
    );
    const nextScheduled = articles
      .filter((a) => a.status === 'scheduled' && a.scheduledAt)
      .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!))[0];

    return {
      perDay,
      statusCounts,
      publishedToday: inLastDays(today, today + DAY).length,
      publishedYesterday: inLastDays(today - DAY, today).length,
      viewsThisWeek,
      viewsPrevWeek,
      oldestReview,
      nextScheduled,
    };
  }, [articles, now]);

  const labels = useMemo(() => dayLabels(CHART_DAYS, now), [now]);
  const perSiteSeries = useMemo(
    () =>
      SITES.map((site) => ({
        id: site.id,
        label: site.name,
        color: site.color,
        data: publishedPerDay(articles, CHART_DAYS, now, site.id),
        stack: 'total',
        area: true,
        showMark: false,
      })),
    [articles, now],
  );

  const viewsBySite = useMemo(
    () => SITES.map((site) => articles.filter((a) => a.siteId === site.id).reduce((sum, a) => sum + a.views, 0)),
    [articles],
  );
  const siteCounts = useMemo(() => countBySite(articles), [articles]);
  const firstName = state.profile.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`${greeting(new Date(now).getHours())}, ${firstName}`}
        subtitle={`${formatDate(new Date(now).toISOString(), 'dddd, MMMM D, YYYY')} · here is what is happening in the newsroom today.`}
        actions={
          <>
            <Button variant="outlined" component={RouterLink} to="/publisher" startIcon={<RateReviewRoundedIcon />}>
              Open publisher
            </Button>
            <Button variant="contained" component={RouterLink} to="/publisher/articles/new" startIcon={<AddRoundedIcon />}>
              New article
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCardLink
            to="/articles?status=published"
            label="Published today"
            value={stats.publishedToday}
            icon={<PublishedWithChangesRoundedIcon />}
            color="success"
            delta={percentChange(stats.publishedToday, stats.publishedYesterday)}
            trend={stats.perDay}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCardLink
            to="/publisher"
            label="Waiting for review"
            value={stats.statusCounts.in_review}
            icon={<RateReviewRoundedIcon />}
            color="warning"
            caption={stats.oldestReview ? `Oldest submitted ${formatRelative(stats.oldestReview)}` : 'Queue is empty'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCardLink
            to="/articles?status=scheduled"
            label="Scheduled"
            value={stats.statusCounts.scheduled}
            icon={<EventRoundedIcon />}
            color="info"
            caption={stats.nextScheduled ? `Next ${formatRelative(stats.nextScheduled.scheduledAt)}` : 'Nothing scheduled'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCardLink
            to="/articles"
            label="Views (7 days)"
            value={formatCompact(stats.viewsThisWeek)}
            icon={<VisibilityRoundedIcon />}
            color="primary"
            delta={percentChange(stats.viewsThisWeek, stats.viewsPrevWeek)}
            caption="Articles published this week"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Publishing activity" subheader={`Articles published per day · last ${CHART_DAYS} days`} />
            <CardContent sx={{ pt: 0 }}>
              <LineChart
                height={320}
                xAxis={[{ scaleType: 'point', data: labels }]}
                yAxis={[{ tickMinStep: 1 }]}
                series={perSiteSeries}
                grid={{ horizontal: true }}
                // Extra right margin so the last date label is not truncated.
                margin={{ left: 0, right: 28 }}
                slotProps={{ legend: { position: { vertical: 'top', horizontal: 'center' } } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <SiteShareChart counts={siteCounts} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EditorialQueue articles={articles} />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <TopArticles articles={articles} photos={state.photos} />
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Total views by site" subheader="All-time readership of published articles" />
            <CardContent sx={{ pt: 0 }}>
              <BarChart
                height={300}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: SITES.map((site) => site.name.replace(/^The /, '')),
                    colorMap: { type: 'ordinal', colors: SITES.map((site) => site.color) },
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                yAxis={[{ valueFormatter: (value: number) => formatCompact(value) }]}
                series={[{ data: viewsBySite, label: 'Views', valueFormatter: (value) => formatCompact(value ?? 0) }]}
                grid={{ horizontal: true }}
                borderRadius={6}
                hideLegend
                margin={{ left: 0, right: 8 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 3 }}>
          <MediaSummary photos={state.photos} videos={state.videos} />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ActivityFeed events={state.activity.slice(0, 7)} />
        </Grid>
      </Grid>
    </>
  );
}

/** StatCard that navigates to a filtered view when clicked. */
function StatCardLink({ to, ...props }: ComponentProps<typeof StatCard> & { to: string }) {
  return (
    <CardActionArea component={RouterLink} to={to} sx={{ borderRadius: 3.5, height: '100%' }}>
      <StatCard {...props} />
    </CardActionArea>
  );
}
