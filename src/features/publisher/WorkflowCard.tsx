import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { PriorityChip, SiteChip } from '../../components/Chips';
import { UserAvatar } from '../../components/UserAvatar';
import { findPhoto, getAuthorName } from '../../store/selectors';
import type { Article, ArticleStatus, Photo } from '../../types';
import { formatDateTime, formatRelative } from '../../utils/format';
import { nextStatus, previousStatus, STATUS_META } from '../../utils/workflow';

const NEXT_LABEL: Partial<Record<ArticleStatus, string>> = {
  draft: 'Submit for review',
  in_review: 'Approve & schedule',
  scheduled: 'Publish now',
};

interface WorkflowCardProps {
  article: Article;
  photos: Photo[];
  onMove: (article: Article, target: ArticleStatus) => void;
}

/** Draggable card on the publisher board. */
export function WorkflowCard({ article, photos, onMove }: WorkflowCardProps) {
  const photo = findPhoto(photos, article.featuredImageId);
  const next = nextStatus(article.status);
  const previous = previousStatus(article.status);
  const author = getAuthorName(article.authorId);

  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', article.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      sx={{
        cursor: 'grab',
        borderLeft: 4,
        borderLeftColor: article.priority === 'breaking' ? 'error.main' : article.priority === 'high' ? 'warning.main' : 'divider',
        transition: 'box-shadow .15s, transform .15s',
        '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {photo && (
        <Box component="img" src={photo.thumbnailUrl} alt="" loading="lazy" sx={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
      )}
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
          <SiteChip siteId={article.siteId} short sx={{ height: 22, fontSize: 11 }} />
          {article.priority !== 'normal' && <PriorityChip priority={article.priority} sx={{ height: 22, fontSize: 11 }} />}
        </Stack>
        <Link
          component={RouterLink}
          to={`/publisher/articles/${article.id}`}
          underline="hover"
          color="inherit"
          sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.35, display: 'block' }}
        >
          {article.title || 'Untitled article'}
        </Link>
        {article.status === 'scheduled' && article.scheduledAt && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1, color: 'info.main' }}>
            <EventRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {formatDateTime(article.scheduledAt)}
            </Typography>
          </Stack>
        )}
        {article.editorNotes && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start', mt: 1, color: 'text.secondary' }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, mt: 0.25 }} />
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              {article.editorNotes}
            </Typography>
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.25 }}>
          <UserAvatar name={author} size={22} withTooltip />
          <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }} noWrap>
            {formatRelative(article.status === 'published' ? article.publishedAt : article.updatedAt)}
          </Typography>
          {previous && (
            <Tooltip title={`Back to ${STATUS_META[previous].label.toLowerCase()}`}>
              <IconButton size="small" onClick={() => onMove(article, previous)} aria-label={`Move back to ${STATUS_META[previous].label}`}>
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {next && (
            <Tooltip title={NEXT_LABEL[article.status] ?? ''}>
              <IconButton size="small" color="primary" onClick={() => onMove(article, next)} aria-label={NEXT_LABEL[article.status]}>
                <ArrowForwardRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
