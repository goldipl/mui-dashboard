import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { SiteChip } from '../../components/Chips';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { StatCard } from '../../components/StatCard';
import { SITES } from '../../data/sites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { SiteId, Video, VideoStatus } from '../../types';
import { formatCompact, formatDuration, formatRelative } from '../../utils/format';
import { VideoDialog } from './VideoDialog';
import { VideoUploadDialog } from './VideoUploadDialog';

const STATUS_LABEL: Record<VideoStatus, string> = { ready: 'Ready', processing: 'Processing', failed: 'Failed' };

export default function VideosPage() {
  const { state, actions } = useNewsroom();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [status, setStatus] = useState<VideoStatus | 'all'>('all');
  const [siteId, setSiteId] = useState<SiteId | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'views' | 'duration'>('newest');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { videos } = state;
  const counts = useMemo(
    () => ({
      ready: videos.filter((v) => v.status === 'ready').length,
      processing: videos.filter((v) => v.status === 'processing').length,
      failed: videos.filter((v) => v.status === 'failed').length,
      views: videos.reduce((sum, v) => sum + v.views, 0),
    }),
    [videos],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const sorters: Record<typeof sort, (a: Video, b: Video) => number> = {
      newest: (a, b) => b.uploadedAt.localeCompare(a.uploadedAt),
      views: (a, b) => b.views - a.views,
      duration: (a, b) => b.durationSec - a.durationSec,
    };
    return videos
      .filter((v) => status === 'all' || v.status === status)
      .filter((v) => siteId === 'all' || v.siteId === siteId)
      .filter((v) => !q || `${v.title} ${v.description} ${v.tags.join(' ')}`.toLowerCase().includes(q))
      .sort(sorters[sort]);
  }, [videos, status, siteId, debouncedQuery, sort]);

  const activeVideo = videos.find((v) => v.id === activeId) ?? null;

  return (
    <>
      <PageHeader
        title="Videos"
        subtitle="Video library shared by all newsroom sites"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Media' }, { label: 'Videos' }]}
        actions={
          <Button variant="contained" startIcon={<VideoCallRoundedIcon />} onClick={() => setUploadOpen(true)}>
            Upload video
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <StatCard label="Ready to publish" value={counts.ready} icon={<CheckCircleRoundedIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <StatCard label="Processing" value={counts.processing} icon={<HourglassTopRoundedIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <StatCard label="Failed" value={counts.failed} icon={<ErrorRoundedIcon />} color="error" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <StatCard label="Total plays" value={formatCompact(counts.views)} icon={<VisibilityRoundedIcon />} />
        </Grid>
      </Grid>

      <Card sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <SearchField value={query} onChange={setQuery} placeholder="Search videos…" sx={{ flex: 1 }} />
          <ToggleButtonGroup size="small" exclusive value={status} onChange={(_, v) => v && setStatus(v)}>
            <ToggleButton value="all">All ({videos.length})</ToggleButton>
            <ToggleButton value="ready">Ready ({counts.ready})</ToggleButton>
            <ToggleButton value="processing">Processing ({counts.processing})</ToggleButton>
            <ToggleButton value="failed">Failed ({counts.failed})</ToggleButton>
          </ToggleButtonGroup>
          <TextField select label="Site" value={siteId} onChange={(e) => setSiteId(e.target.value as SiteId | 'all')} sx={{ minWidth: 170 }}>
            <MenuItem value="all">All sites</MenuItem>
            {SITES.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} sx={{ minWidth: 150 }}>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="views">Most viewed</MenuItem>
            <MenuItem value="duration">Longest</MenuItem>
          </TextField>
        </Stack>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<VideoLibraryRoundedIcon />} title="No videos found" description="Change the filters or upload a new video." />
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((video) => (
            <Card key={video.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <ButtonBase onClick={() => setActiveId(video.id)} sx={{ display: 'block', textAlign: 'left' }} aria-label={`Open ${video.title}`}>
                <Box sx={{ position: 'relative', aspectRatio: '16 / 9', bgcolor: 'action.hover', '&:hover .play': { opacity: 1 } }}>
                  <Box
                    component="img"
                    src={video.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: video.status === 'ready' ? 'none' : 'grayscale(0.7) brightness(0.7)' }}
                  />
                  {video.status === 'ready' && (
                    <Box
                      className="play"
                      sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity .2s' }}
                    >
                      <PlayArrowRoundedIcon sx={{ fontSize: 56, color: '#fff' }} />
                    </Box>
                  )}
                  <Chip
                    size="small"
                    label={formatDuration(video.durationSec)}
                    sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', height: 22 }}
                  />
                  <Chip
                    size="small"
                    label={video.status === 'processing' ? `${STATUS_LABEL.processing} ${video.progress}%` : STATUS_LABEL[video.status]}
                    color={video.status === 'ready' ? 'success' : video.status === 'processing' ? 'info' : 'error'}
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  />
                  <Chip size="small" label={video.resolution} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }} />
                </Box>
                {video.status === 'processing' && <LinearProgress variant="determinate" value={video.progress} />}
              </ButtonBase>
              <Stack spacing={1} sx={{ p: 1.75, flex: 1 }}>
                <Typography sx={{ fontWeight: 600, lineHeight: 1.35 }}>{video.title}</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 'auto !important' }}>
                  <SiteChip siteId={video.siteId} short />
                  <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }} noWrap>
                    {video.status === 'ready' ? `${formatCompact(video.views)} plays · ` : ''}
                    {formatRelative(video.uploadedAt)}
                  </Typography>
                  {video.status === 'failed' && (
                    <Button
                      size="small"
                      startIcon={<ReplayRoundedIcon />}
                      onClick={() => {
                        actions.updateVideo(video.id, { status: 'processing', progress: 0 });
                        notify('Transcoding restarted.', 'info');
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      <VideoDialog video={activeVideo} onClose={() => setActiveId(null)} />
      <VideoUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
