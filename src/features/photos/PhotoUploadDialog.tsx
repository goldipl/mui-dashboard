import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState, type DragEvent } from 'react';
import { CURRENT_USER_ID } from '../../data/sites';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { Photo, PhotoLicense } from '../../types';
import { createId } from '../../utils/id';
import { resizeImage, titleFromFileName } from '../../utils/image';
import { LICENSE_LABELS, LICENSES } from './photoMeta';

const MAX_FILES = 10;
const MAX_FILE_MB = 15;

interface PendingFile {
  id: string;
  file: File;
  title: string;
  previewUrl: string;
}

export function PhotoUploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useNewsroom();
  const notify = useNotify();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [credit, setCredit] = useState('Staff photographer');
  const [license, setLicense] = useState<PhotoLicense>('editorial');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFiles([]);
    setError(null);
    setBusy(false);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: PendingFile[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) rejected.push(`${file.name} is not an image`);
      else if (file.size > MAX_FILE_MB * 1024 * 1024) rejected.push(`${file.name} exceeds ${MAX_FILE_MB} MB`);
      else accepted.push({ id: createId('file'), file, title: titleFromFileName(file.name), previewUrl: URL.createObjectURL(file) });
    }
    const next = [...files, ...accepted].slice(0, MAX_FILES);
    if (files.length + accepted.length > MAX_FILES) rejected.push(`Only ${MAX_FILES} files can be uploaded at once`);
    setFiles(next);
    setError(rejected.length ? rejected.join(' · ') : null);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const upload = async () => {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const photos: Photo[] = [];
      for (const item of files) {
        const resized = await resizeImage(item.file);
        photos.push({
          id: createId('ph'),
          title: item.title.trim() || 'Untitled photo',
          caption: '',
          url: resized.dataUrl,
          thumbnailUrl: resized.thumbnailUrl,
          width: resized.width,
          height: resized.height,
          credit,
          license,
          tags: [],
          format: 'jpg',
          sizeKb: resized.sizeKb,
          uploadedAt: now,
          uploadedBy: CURRENT_USER_ID,
        });
      }
      actions.addPhotos(photos);
      notify(`${photos.length} photo${photos.length > 1 ? 's' : ''} uploaded.`);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Upload photos</DialogTitle>
      <DialogContent dividers>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={(theme) => ({
            border: `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: dragging ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all .15s',
            '&:hover, &:focus-visible': { borderColor: 'primary.main', outline: 'none' },
          })}
        >
          <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 44 }} />
          <Typography sx={{ fontWeight: 600, mt: 1 }}>Drag & drop images here or click to browse</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            JPG, PNG or WebP · up to {MAX_FILES} files · max {MAX_FILE_MB} MB each
          </Typography>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {files.length > 0 && (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {files.map((item) => (
              <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box component="img" src={item.previewUrl} alt="" sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1.5 }} />
                <TextField
                  value={item.title}
                  onChange={(e) => setFiles((list) => list.map((f) => (f.id === item.id ? { ...f, title: e.target.value } : f)))}
                  label="Title"
                  fullWidth
                />
                <IconButton
                  aria-label={`Remove ${item.file.name}`}
                  onClick={() => {
                    URL.revokeObjectURL(item.previewUrl);
                    setFiles((list) => list.filter((f) => f.id !== item.id));
                  }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            ))}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
              <TextField label="Credit" value={credit} onChange={(e) => setCredit(e.target.value)} fullWidth />
              <TextField select label="License" value={license} onChange={(e) => setLicense(e.target.value as PhotoLicense)} fullWidth>
                {LICENSES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {LICENSE_LABELS[value]}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Images are resized in the browser (max 1600 px) and stored locally for this demo.
            </Typography>
          </Stack>
        )}
        {busy && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={close} color="inherit" disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={upload} disabled={files.length === 0 || busy} startIcon={<CloudUploadRoundedIcon />}>
          Upload {files.length > 0 ? files.length : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
