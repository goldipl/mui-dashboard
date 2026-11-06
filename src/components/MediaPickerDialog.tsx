import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useNewsroom } from '../store/useNewsroom';
import { formatDuration } from '../utils/format';
import { EmptyState } from './EmptyState';
import { SearchField } from './SearchField';

interface MediaPickerDialogProps {
  open: boolean;
  kind: 'photo' | 'video';
  selectedId?: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

interface PickerItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  meta: string;
}

/** Lets the editor choose a photo or a (ready) video from the media library. */
export function MediaPickerDialog({ open, kind, selectedId, onClose, onSelect }: MediaPickerDialogProps) {
  const { state } = useNewsroom();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<string | undefined>(selectedId);

  const items = useMemo<PickerItem[]>(() => {
    const source: PickerItem[] =
      kind === 'photo'
        ? state.photos.map((p) => ({ id: p.id, title: p.title, thumbnailUrl: p.thumbnailUrl, meta: p.credit }))
        : state.videos
            .filter((v) => v.status === 'ready')
            .map((v) => ({ id: v.id, title: v.title, thumbnailUrl: v.thumbnailUrl, meta: formatDuration(v.durationSec) }));
    const q = query.trim().toLowerCase();
    return q ? source.filter((item) => item.title.toLowerCase().includes(q)) : source;
  }, [kind, query, state.photos, state.videos]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      slotProps={{ transition: { onEnter: () => setCurrent(selectedId) } }}
    >
      <DialogTitle>{kind === 'photo' ? 'Choose a photo' : 'Choose a video'}</DialogTitle>
      <DialogContent dividers>
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${kind}s…`} fullWidth sx={{ mb: 2 }} />
        {items.length === 0 ? (
          <EmptyState title="Nothing found" description="Try a different search phrase." />
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {items.map((item) => {
              const selected = item.id === current;
              return (
                <ButtonBase
                  key={item.id}
                  onClick={() => setCurrent(item.id)}
                  onDoubleClick={() => onSelect(item.id)}
                  aria-pressed={selected}
                  sx={{
                    display: 'block',
                    textAlign: 'left',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: 2,
                    borderColor: selected ? 'primary.main' : 'transparent',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16 / 10' }}>
                    <Box
                      component="img"
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {kind === 'video' && (
                      <PlayCircleRoundedIcon
                        sx={{ position: 'absolute', inset: 0, m: 'auto', fontSize: 40, color: 'common.white', opacity: 0.85 }}
                      />
                    )}
                    {selected && (
                      <CheckCircleRoundedIcon
                        color="primary"
                        sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper', borderRadius: '50%' }}
                      />
                    )}
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="p">
                      {item.meta}
                    </Typography>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" disabled={!current} onClick={() => current && onSelect(current)}>
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
}
