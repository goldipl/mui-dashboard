import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SITES } from '../../data/sites';
import { useNotify } from '../../hooks/useNotify';
import { getAuthorName } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import type { SiteId, Video } from '../../types';
import { formatDateTime, formatDuration, formatFileSize, formatNumber } from '../../utils/format';

interface VideoDialogProps {
  video: Video | null;
  onClose: () => void;
}

export function VideoDialog({ video, onClose }: VideoDialogProps) {
  return (
    <Dialog open={Boolean(video)} onClose={onClose} maxWidth="md" fullWidth>
      {video && <VideoDetails key={video.id} video={video} onClose={onClose} />}
    </Dialog>
  );
}

function VideoDetails({ video, onClose }: { video: Video; onClose: () => void }) {
  const { actions } = useNewsroom();
  const notify = useNotify();
  const [draft, setDraft] = useState({ title: video.title, description: video.description, siteId: video.siteId, tags: video.tags });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const info: [string, string][] = [
    ['Duration', formatDuration(video.durationSec)],
    ['Resolution', video.resolution],
    ['File size', formatFileSize(video.sizeMb * 1024)],
    ['Views', formatNumber(video.views)],
    ['Uploaded', formatDateTime(video.uploadedAt)],
    ['Uploaded by', getAuthorName(video.uploadedBy)],
  ];

  return (
    <>
      <DialogTitle>{video.title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'common.black', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center' }}>
              {video.status === 'ready' ? (
                <Box component="video" src={video.src} poster={video.thumbnailUrl} controls sx={{ width: '100%', height: '100%' }} />
              ) : video.status === 'processing' ? (
                <Stack spacing={1.5} sx={{ color: 'common.white', alignItems: 'center', width: '70%' }}>
                  <HourglassTopRoundedIcon sx={{ fontSize: 40 }} />
                  <Typography>Transcoding… {video.progress}%</Typography>
                  <LinearProgress variant="determinate" value={video.progress} sx={{ width: '100%', height: 6, borderRadius: 3 }} />
                </Stack>
              ) : (
                <Alert severity="error" sx={{ m: 2 }}>
                  Transcoding failed. Retry from the video card or upload the file again.
                </Alert>
              )}
            </Box>
            <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 2, mb: 0 }}>
              {info.map(([label, value]) => (
                <div key={label}>
                  <Typography component="dt" variant="caption" sx={{ color: 'text.secondary' }}>
                    {label}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600 }}>
                    {value}
                  </Typography>
                </div>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <TextField label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} fullWidth />
              <TextField
                label="Description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                multiline
                minRows={4}
                fullWidth
              />
              <TextField select label="Site" value={draft.siteId} onChange={(e) => setDraft({ ...draft, siteId: e.target.value as SiteId })} fullWidth>
                {SITES.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.name}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={draft.tags}
                onChange={(_, tags) => setDraft({ ...draft, tags })}
                renderInput={(params) => <TextField {...params} label="Tags" />}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, justifyContent: 'space-between' }}>
        <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            disabled={!draft.title.trim()}
            onClick={() => {
              actions.updateVideo(video.id, { ...draft, title: draft.title.trim() });
              notify('Video details saved.');
              onClose();
            }}
          >
            Save
          </Button>
        </Stack>
      </DialogActions>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete video?"
        description={`“${video.title}” will be removed from the library.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteVideos([video.id]);
          notify('Video deleted.');
          onClose();
        }}
      />
    </>
  );
}
