import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { useMemo, useState } from 'react';
import { StatusChip } from '../../components/Chips';
import { countByStatus, dayLabels, publishedPerDay } from '../../store/selectors';
import type { Article, EditorProfile } from '../../types';
import { formatCompact } from '../../utils/format';
import { STATUS_ORDER } from '../../utils/workflow';

const DAYS = 30;

interface ProfileOverviewProps {
  profile: EditorProfile;
  articles: Article[];
}

export function ProfileOverview({ profile, articles }: ProfileOverviewProps) {
  const [now] = useState(() => Date.now());
  const perDay = useMemo(() => publishedPerDay(articles, DAYS, now), [articles, now]);
  const labels = useMemo(() => dayLabels(DAYS, now), [now]);
  const statusCounts = useMemo(() => countByStatus(articles), [articles]);
  const published = articles.filter((a) => a.publishedAt);
  const avgViews = published.length ? published.reduce((sum, a) => sum + a.views, 0) / published.length : 0;
  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articles) counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [articles]);
  const maxCategory = topCategories[0]?.[1] ?? 1;

  const contacts = [
    { icon: <EmailRoundedIcon fontSize="small" />, label: 'Email', value: profile.email },
    { icon: <PhoneRoundedIcon fontSize="small" />, label: 'Phone', value: profile.phone },
    { icon: <TagRoundedIcon fontSize="small" />, label: 'X', value: profile.social.x },
    { icon: <LinkedInIcon fontSize="small" />, label: 'LinkedIn', value: profile.social.linkedin },
  ].filter((item) => item.value);

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Stack spacing={2.5}>
          <Card>
            <CardHeader title="About" />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                {profile.bio}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense disablePadding>
                {contacts.map((item) => (
                  <ListItem key={item.label} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.value} secondary={item.label} slotProps={{ primary: { sx: { wordBreak: 'break-all' } } }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Beats & languages" />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Beats
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {profile.beats.map((beat) => (
                  <Chip key={beat} label={beat} color="primary" variant="outlined" size="small" />
                ))}
              </Stack>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Languages
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {profile.languages.map((language) => (
                  <Chip key={language} label={language} size="small" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Stack spacing={2.5}>
          <Card>
            <CardHeader title="My publications" subheader={`Articles published per day · last ${DAYS} days`} />
            <CardContent sx={{ pt: 0 }}>
              <BarChart
                height={240}
                xAxis={[{ scaleType: 'band', data: labels, tickLabelStyle: { fontSize: 10 }, tickInterval: (_v, i) => i % 5 === 0 }]}
                yAxis={[{ tickMinStep: 1 }]}
                series={[{ data: perDay, label: 'Published', color: '#1f4fd8' }]}
                borderRadius={4}
                hideLegend
                grid={{ horizontal: true }}
                margin={{ left: 0, right: 8 }}
              />
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Workflow status" subheader="All articles I authored" />
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={1.25}>
                    {STATUS_ORDER.map((status) => (
                      <Stack key={status} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <StatusChip status={status} />
                        <Typography sx={{ fontWeight: 700 }}>{statusCounts[status]}</Typography>
                      </Stack>
                    ))}
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Average views per article
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{formatCompact(avgViews)}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Top categories" subheader="Where I write most" />
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={1.75}>
                    {topCategories.map(([category, count]) => (
                      <Box key={category}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {category}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {count}
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={(count / maxCategory) * 100} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}
