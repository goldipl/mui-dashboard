import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { StatusChip } from '../../components/Chips';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useNotify } from '../../hooks/useNotify';
import { articlesUsingMedia, getAuthorName } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import type { Photo } from '../../types';
import { formatDateTime, formatFileSize } from '../../utils/format';
import { LICENSE_LABELS, LICENSES } from './photoMeta';

interface PhotoDetailsDrawerProps {
  photo: Photo | null;
  allTags: string[];
  onClose: () => void;
}

export function PhotoDetailsDrawer({ photo, allTags, onClose }: PhotoDetailsDrawerProps) {
  return (
    <Drawer anchor="right" open={Boolean(photo)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 } } } }}>
      {photo && <PhotoDetails key={photo.id} photo={photo} allTags={allTags} onClose={onClose} />}
    </Drawer>
  );
}

function PhotoDetails({ photo, allTags, onClose }: { photo: Photo; allTags: string[]; onClose: () => void }) {
  const { state, actions } = useNewsroom();
  const notify = useNotify();
  const [draft, setDraft] = useState(photo);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const usage = useMemo(() => articlesUsingMedia(state.articles, photo.id), [state.articles, photo.id]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(photo);

  const info = [
    ['Dimensions', `${photo.width} × ${photo.height}px`],
    ['Format', photo.format.toUpperCase()],
    ['File size', formatFileSize(photo.sizeKb)],
    ['Uploaded', formatDateTime(photo.uploadedAt)],
    ['Uploaded by', getAuthorName(photo.uploadedBy)],
  ];

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(photo.url);
      notify('Image URL copied to clipboard.');
    } catch {
      notify('Clipboard is not available.', 'error');
    }
  };

  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ flex: 1 }} noWrap>
          Photo details
        </Typography>
        <IconButton onClick={onClose} aria-label="Close details">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', mb: 1.5 }}>
          <Box component="img" src={photo.url} alt={photo.title} sx={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'contain' }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={copyUrl}>
            Copy URL
          </Button>
          <Button size="small" startIcon={<OpenInNewRoundedIcon />} href={photo.url} target="_blank" rel="noopener noreferrer">
            Open original
          </Button>
        </Stack>

        <Stack spacing={2}>
          <TextField label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} fullWidth />
          <TextField label="Caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} multiline minRows={2} fullWidth />
          <Stack direction="row" spacing={1.5}>
            <TextField label="Credit" value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} fullWidth />
            <TextField
              select
              label="License"
              value={draft.license}
              onChange={(e) => setDraft({ ...draft, license: e.target.value as Photo['license'] })}
              fullWidth
            >
              {LICENSES.map((value) => (
                <MenuItem key={value} value={value}>
                  {LICENSE_LABELS[value]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Autocomplete
            multiple
            freeSolo
            options={allTags}
            value={draft.tags}
            onChange={(_, tags) => setDraft({ ...draft, tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean) })}
            renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tag" />}
          />
        </Stack>

        <Typography variant="overline" sx={{ display: 'block', mt: 3, color: 'text.secondary' }}>
          File information
        </Typography>
        <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.75, m: 0, fontSize: 14 }}>
          {info.map(([label, value]) => (
            <Box key={label} sx={{ display: 'contents' }}>
              <Box component="dt" sx={{ color: 'text.secondary' }}>
                {label}
              </Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 500 }}>
                {value}
              </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="overline" sx={{ display: 'block', mt: 3, color: 'text.secondary' }}>
          Used in {usage.length} article{usage.length === 1 ? '' : 's'}
        </Typography>
        <Stack spacing={1}>
          {usage.slice(0, 6).map((article) => (
            <Stack key={article.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <StatusChip status={article.status} />
              <Link component={RouterLink} to={`/publisher/articles/${article.id}`} underline="hover" noWrap sx={{ fontSize: 14 }}>
                {article.title}
              </Link>
            </Stack>
          ))}
          {usage.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This photo is not used yet.
            </Typography>
          )}
        </Stack>
      </Box>
      <Divider />
      <Stack direction="row" spacing={1} sx={{ p: 2, justifyContent: 'space-between' }}>
        <Tooltip title={usage.length ? 'Featured images will be removed from articles' : ''}>
          <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          disabled={!dirty || !draft.title.trim()}
          onClick={() => {
            const { id, ...changes } = draft;
            actions.updatePhoto(id, changes);
            notify('Photo details saved.');
          }}
        >
          Save changes
        </Button>
      </Stack>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete photo?"
        description={
          usage.length > 0 ? (
            <Alert severity="warning">
              This photo is used in {usage.length} article{usage.length > 1 ? 's' : ''}. It will be removed as their featured image.
            </Alert>
          ) : (
            'The photo will be permanently removed from the library.'
          )
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deletePhotos([photo.id]);
          notify('Photo deleted.');
          onClose();
        }}
      />
    </Stack>
  );
}
