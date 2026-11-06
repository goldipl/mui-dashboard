import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { SiteChip } from '../../components/Chips';
import { PageHeader } from '../../components/PageHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { useNewsroom } from '../../store/useNewsroom';
import { formatCompact, formatDate } from '../../utils/format';
import { ArticlesTable } from '../articles/ArticlesTable';
import { ProfileActivity } from './ProfileActivity';
import { ProfileOverview } from './ProfileOverview';
import { ProfileSettingsForm } from './ProfileSettingsForm';

const TABS = ['overview', 'articles', 'activity', 'settings'] as const;
type ProfileTab = (typeof TABS)[number];

export default function ProfilePage() {
  const { state } = useNewsroom();
  const { profile } = state;
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab') as ProfileTab | null;
  const tab: ProfileTab = tabParam && TABS.includes(tabParam) ? tabParam : 'overview';

  const myArticles = useMemo(() => state.articles.filter((a) => a.authorId === profile.id), [state.articles, profile.id]);
  const published = myArticles.filter((a) => a.status === 'published');
  const totalViews = published.reduce((sum, a) => sum + a.views, 0);

  const setTab = (value: ProfileTab) => setParams(value === 'overview' ? {} : { tab: value }, { replace: true });

  return (
    <>
      <PageHeader title="My profile" breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'My profile' }]} />

      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={(theme) => ({
            height: { xs: 110, md: 150 },
            background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            },
          })}
        />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 3 }}
          sx={{ px: { xs: 2, md: 3 }, pb: 2.5, alignItems: { xs: 'flex-start', md: 'flex-end' } }}
        >
          <UserAvatar name={profile.name} size={112} sx={{ mt: -7, border: 4, borderColor: 'background.paper', fontSize: 40 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" component="h2">
              {profile.name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{profile.role}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1, color: 'text.secondary', flexWrap: 'wrap', rowGap: 0.5 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <LocationOnRoundedIcon fontSize="small" />
                <Typography variant="body2">{profile.location}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <EventAvailableRoundedIcon fontSize="small" />
                <Typography variant="body2">Joined {formatDate(profile.joinedAt, 'MMMM YYYY')}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 0.75 }}>
              {profile.siteIds.map((siteId) => (
                <SiteChip key={siteId} siteId={siteId} />
              ))}
            </Stack>
          </Box>
          <Stack direction="row" spacing={3} sx={{ textAlign: 'center' }}>
            {[
              { label: 'Articles', value: myArticles.length, icon: <ArticleRoundedIcon fontSize="small" /> },
              { label: 'Published', value: published.length, icon: <PublishedWithChangesRoundedIcon fontSize="small" /> },
              { label: 'Views', value: formatCompact(totalViews), icon: <VisibilityRoundedIcon fontSize="small" /> },
            ].map((item) => (
              <Box key={item.label}>
                <Typography variant="h5" component="p">
                  {item.value}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  {item.icon}
                  <Typography variant="caption">{item.label}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
          <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setTab('settings')}>
            Edit profile
          </Button>
        </Stack>
        <Tabs value={tab} onChange={(_, value: ProfileTab) => setTab(value)} variant="scrollable" sx={{ px: 2, borderTop: 1, borderColor: 'divider' }}>
          <Tab value="overview" label="Overview" />
          <Tab value="articles" label={`My articles (${myArticles.length})`} />
          <Tab value="activity" label="Activity" />
          <Tab value="settings" label="Settings" />
        </Tabs>
      </Card>

      {tab === 'overview' && <ProfileOverview profile={profile} articles={myArticles} />}
      {tab === 'articles' && (
        <Card>
          <ArticlesTable articles={myArticles} hideAuthor height={640} />
        </Card>
      )}
      {tab === 'activity' && <ProfileActivity events={state.activity} userId={profile.id} />}
      {tab === 'settings' && <ProfileSettingsForm key={JSON.stringify(profile)} profile={profile} />}
    </>
  );
}
