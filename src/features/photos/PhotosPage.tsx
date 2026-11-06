import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { Photo, PhotoLicense } from '../../types';
import { formatDate, formatFileSize } from '../../utils/format';
import { PhotoDetailsDrawer } from './PhotoDetailsDrawer';
import { LICENSE_LABELS, LICENSES } from './photoMeta';
import { PhotoUploadDialog } from './PhotoUploadDialog';

const PAGE_SIZE = 24;
type SortKey = 'newest' | 'oldest' | 'title' | 'size';

const SORTERS: Record<SortKey, (a: Photo, b: Photo) => number> = {
  newest: (a, b) => b.uploadedAt.localeCompare(a.uploadedAt),
  oldest: (a, b) => a.uploadedAt.localeCompare(b.uploadedAt),
  title: (a, b) => a.title.localeCompare(b.title),
  size: (a, b) => b.sizeKb - a.sizeKb,
};

export default function PhotosPage() {
  const { state, actions } = useNewsroom();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [license, setLicense] = useState<PhotoLicense | 'all'>('all');
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allTags = useMemo(() => [...new Set(state.photos.flatMap((p) => p.tags))].sort(), [state.photos]);
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return state.photos
      .filter((p) => license === 'all' || p.license === license)
      .filter((p) => !tag || p.tags.includes(tag))
      .filter((p) => !q || `${p.title} ${p.caption} ${p.credit} ${p.tags.join(' ')}`.toLowerCase().includes(q))
      .sort(SORTERS[sort]);
  }, [state.photos, license, tag, debouncedQuery, sort]);

  const visible = filtered.slice(0, limit);
  const activePhoto = state.photos.find((p) => p.id === activeId) ?? null;
  const totalSize = state.photos.reduce((sum, p) => sum + p.sizeKb, 0);

  const toggleSelected = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  const openPhoto = (id: string) => (selectMode ? toggleSelected(id) : setActiveId(id));

  return (
    <>
      <PageHeader
        title="Photos"
        subtitle={`${state.photos.length} photos · ${formatFileSize(totalSize)} in the library`}
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Media' }, { label: 'Photos' }]}
        actions={
          <>
            <Button
              variant={selectMode ? 'contained' : 'outlined'}
              color={selectMode ? 'secondary' : 'primary'}
              startIcon={selectMode ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
              onClick={() => {
                setSelectMode((v) => !v);
                setSelected([]);
              }}
            >
              {selectMode ? 'Done' : 'Select'}
            </Button>
            <Button variant="contained" startIcon={<CloudUploadRoundedIcon />} onClick={() => setUploadOpen(true)}>
              Upload photos
            </Button>
          </>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <SearchField value={query} onChange={setQuery} placeholder="Search title, caption, credit…" sx={{ flex: 1 }} />
          <TextField select label="License" value={license} onChange={(e) => setLicense(e.target.value as PhotoLicense | 'all')} sx={{ minWidth: 190 }}>
            <MenuItem value="all">All licenses</MenuItem>
            {LICENSES.map((value) => (
              <MenuItem key={value} value={value}>
                {LICENSE_LABELS[value]}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} sx={{ minWidth: 150 }}>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="oldest">Oldest first</MenuItem>
            <MenuItem value="title">Title A–Z</MenuItem>
            <MenuItem value="size">Largest files</MenuItem>
          </TextField>
          <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="View mode">
            <ToggleButton value="grid" aria-label="Grid view">
              <GridViewRoundedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="List view">
              <ViewListRoundedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction="row" sx={{ px: 2, pb: 2, gap: 0.75, flexWrap: 'wrap' }}>
          {allTags.map((value) => (
            <Chip
              key={value}
              label={`#${value}`}
              size="small"
              variant={tag === value ? 'filled' : 'outlined'}
              color={tag === value ? 'primary' : 'default'}
              onClick={() => setTag(tag === value ? null : value)}
            />
          ))}
        </Stack>
      </Card>

      {selectMode && (
        <Card sx={{ mb: 2, px: 2, py: 1.25 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 600, flex: 1 }}>{selected.length} selected</Typography>
            <Button size="small" onClick={() => setSelected(visible.map((p) => p.id))}>
              Select visible
            </Button>
            <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} disabled={!selected.length} onClick={() => setConfirmDelete(true)}>
              Delete selected
            </Button>
          </Stack>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<PhotoLibraryRoundedIcon />} title="No photos found" description="Change the filters or upload new photos." />
        </Card>
      ) : view === 'grid' ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {visible.map((photo) => {
            const isSelected = selected.includes(photo.id);
            return (
              <Card key={photo.id} sx={{ overflow: 'hidden', borderColor: isSelected ? 'primary.main' : undefined, borderWidth: isSelected ? 2 : 1 }}>
                <ButtonBase onClick={() => openPhoto(photo.id)} sx={{ display: 'block', width: '100%', textAlign: 'left' }} aria-label={`Open ${photo.title}`}>
                  <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'action.hover', overflow: 'hidden', '&:hover img': { transform: 'scale(1.04)' } }}>
                    <Box component="img" src={photo.thumbnailUrl} alt={photo.title} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
                    {selectMode && (
                      <Checkbox checked={isSelected} sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'background.paper', borderRadius: 1, p: 0.25, '&:hover': { bgcolor: 'background.paper' } }} tabIndex={-1} />
                    )}
                    <Chip label={photo.format.toUpperCase()} size="small" sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', height: 22, fontSize: 11 }} />
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {photo.title}
                    </Typography>
                    <Typography variant="caption" noWrap component="p" sx={{ color: 'text.secondary' }}>
                      {photo.credit} · {LICENSE_LABELS[photo.license]}
                    </Typography>
                  </Box>
                </ButtonBase>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {selectMode && <TableCell padding="checkbox" />}
                  <TableCell>Photo</TableCell>
                  <TableCell>Credit</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Dimensions</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((photo) => (
                  <TableRow key={photo.id} hover onClick={() => openPhoto(photo.id)} sx={{ cursor: 'pointer' }} selected={selected.includes(photo.id)}>
                    {selectMode && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(photo.id)} />
                      </TableCell>
                    )}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box component="img" src={photo.thumbnailUrl} alt="" loading="lazy" sx={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {photo.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{photo.credit}</TableCell>
                    <TableCell>{LICENSE_LABELS[photo.license]}</TableCell>
                    <TableCell>
                      {photo.width}×{photo.height}
                    </TableCell>
                    <TableCell align="right">{formatFileSize(photo.sizeKb)}</TableCell>
                    <TableCell>{formatDate(photo.uploadedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {filtered.length > limit && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Load more ({filtered.length - limit} remaining)
          </Button>
        </Stack>
      )}

      <PhotoDetailsDrawer photo={activePhoto} allTags={allTags} onClose={() => setActiveId(null)} />
      <PhotoUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selected.length} photo${selected.length > 1 ? 's' : ''}?`}
        description="Photos used as featured images will be detached from their articles."
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deletePhotos(selected);
          notify(`${selected.length} photo${selected.length > 1 ? 's' : ''} deleted.`);
          setSelected([]);
          setSelectMode(false);
        }}
      />
    </>
  );
}
