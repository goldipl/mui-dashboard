import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import type { ActivityEvent, ActivityType } from '../types';
import { formatRelative } from '../utils/format';

type PaletteKey = 'primary' | 'success' | 'info' | 'error' | 'secondary' | 'warning';

const ICONS: Record<ActivityType, { icon: ReactElement; color: PaletteKey }> = {
  article_created: { icon: <ArticleRoundedIcon fontSize="small" />, color: 'primary' },
  article_updated: { icon: <EditRoundedIcon fontSize="small" />, color: 'info' },
  article_status: { icon: <PublishRoundedIcon fontSize="small" />, color: 'success' },
  article_deleted: { icon: <DeleteOutlineRoundedIcon fontSize="small" />, color: 'error' },
  photo_uploaded: { icon: <PhotoRoundedIcon fontSize="small" />, color: 'secondary' },
  photo_deleted: { icon: <DeleteOutlineRoundedIcon fontSize="small" />, color: 'error' },
  video_uploaded: { icon: <VideocamRoundedIcon fontSize="small" />, color: 'warning' },
  video_deleted: { icon: <DeleteOutlineRoundedIcon fontSize="small" />, color: 'error' },
  profile_updated: { icon: <PersonRoundedIcon fontSize="small" />, color: 'primary' },
};

/** Vertical timeline of newsroom events. */
export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const theme = useTheme();
  return (
    <Stack>
      {events.map((event, index) => {
        const meta = ICONS[event.type];
        const main = theme.palette[meta.color].main;
        return (
          <Stack key={event.id} direction="row" spacing={1.5}>
            <Stack sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(main, 0.14), color: main }}>{meta.icon}</Avatar>
              {index < events.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
            </Stack>
            <Box sx={{ pb: 2, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {event.message}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatRelative(event.at)}
              </Typography>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}

