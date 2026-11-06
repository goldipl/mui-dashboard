import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import type { Photo, Video } from '../../types';

/** Quick overview of the media library. */
export function MediaSummary({ photos, videos }: { photos: Photo[]; videos: Video[] }) {
  const processing = videos.filter((v) => v.status === 'processing').length;
  const failed = videos.filter((v) => v.status === 'failed').length;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Media library" subheader="Latest uploads" />
      <CardContent sx={{ pt: 0 }}>
        <ImageList cols={3} gap={6} rowHeight={64} sx={{ m: 0, borderRadius: 2, overflow: 'hidden' }}>
          {photos.slice(0, 6).map((photo) => (
            <ImageListItem key={photo.id}>
              <img src={photo.thumbnailUrl} alt={photo.title} loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
            </ImageListItem>
          ))}
        </ImageList>
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={{ mt: 2.5, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <PhotoLibraryRoundedIcon fontSize="small" />
              <Typography variant="body2">Photos</Typography>
            </Stack>
            <Typography variant="h5" component="p">
              {photos.length}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <VideoLibraryRoundedIcon fontSize="small" />
              <Typography variant="body2">Videos</Typography>
            </Stack>
            <Typography variant="h5" component="p">
              {videos.length}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          {processing} processing · {failed} failed
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" component={RouterLink} to="/media/photos" fullWidth>
            Photos
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to="/media/videos" fullWidth>
            Videos
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
