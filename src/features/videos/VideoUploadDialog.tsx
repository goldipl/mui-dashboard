import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { photoUrl } from '../../data/seed';
import { CURRENT_USER_ID, SITES } from '../../data/sites';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { SiteId, Video } from '../../types';
import { formatDuration, formatFileSize } from '../../utils/format';
import { createId } from '../../utils/id';
import { titleFromFileName } from '../../utils/image';

const SAMPLE_SOURCE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const MAX_FILE_MB = 2048;

/** Reads the duration of a local video file using a detached <video> element. */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

export function VideoUploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useNewsroom();
  const notify = useNotify();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [siteId, setSiteId] = useState<SiteId>(state.profile.defaultSiteId);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setDuration(0);
    setTitle('');
    setDescription('');
    setTags([]);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const pickFile = async (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      setError('Please choose a video file (MP4, WebM, MOV).');
      return;
    }
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      setError('Video files are limited to 2 GB.');
      return;
    }
    setError(null);
    setFile(selected);
    if (!title) setTitle(titleFromFileName(selected.name));
    setDuration(await readDuration(selected));
  };

  const upload = () => {
    const id = createId('vid');
    const video: Video = {
      id,
      title: title.trim(),
      description: description.trim(),
      thumbnailUrl: photoUrl(id, 640, 360),
      // Uploaded files are not stored – the demo plays a public-domain sample clip instead.
      src: SAMPLE_SOURCE,
      durationSec: Math.round(duration) || 60,
      status: 'processing',
      progress: 0,
      resolution: '1080p',
      sizeMb: file ? Math.max(1, Math.round(file.size / 1024 / 1024)) : 1,
      siteId,
      tags,
      views: 0,
      uploadedAt: new Date().toISOString(),
      uploadedBy: CURRENT_USER_ID,
    };
    actions.addVideo(video);
    notify('Video uploaded – transcoding has started.');
    close();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Upload video</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box
            sx={{ border: 2, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 3, p: 3, textAlign: 'center' }}
          >
            <MovieCreationRoundedIcon color="primary" sx={{ fontSize: 40 }} />
            {file ? (
              <>
                <Typography sx={{ fontWeight: 600 }}>{file.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatFileSize(file.size / 1024)}
                  {duration > 0 && ` · ${formatDuration(duration)}`}
                </Typography>
              </>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>MP4, WebM or MOV up to 2 GB</Typography>
            )}
            <Button sx={{ mt: 1.5 }} variant="outlined" onClick={() => inputRef.current?.click()}>
              {file ? 'Choose another file' : 'Choose file'}
            </Button>
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={3} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Site" value={siteId} onChange={(e) => setSiteId(e.target.value as SiteId)} fullWidth>
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
              value={tags}
              onChange={(_, value) => setTags(value)}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Type and press Enter" />}
            />
          </Stack>
          <Alert severity="info" variant="outlined">
            This is a demo: the file stays on your computer and transcoding is simulated.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={close} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={upload} disabled={!title.trim()}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
