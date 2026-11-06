import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import UnpublishedRoundedIcon from '@mui/icons-material/UnpublishedRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { StatusChip } from '../../../components/Chips';
import type { Article, ArticleStatus } from '../../../types';
import { formatDateTime, formatRelative } from '../../../utils/format';
import { STATUS_META, type ValidationIssue } from '../../../utils/workflow';

interface PublishPanelProps {
  article: Article;
  isNew: boolean;
  dirty: boolean;
  issues: ValidationIssue[];
  onSave: () => void;
  onStatus: (status: ArticleStatus) => void;
  onSchedule: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

interface PanelAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
}

/** Workflow actions available for the current article status, plus a publishing checklist. */
export function PublishPanel({ article, isNew, dirty, issues, onSave, onStatus, onSchedule, onDuplicate, onDelete }: PublishPanelProps) {
  const save: PanelAction = {
    label: article.status === 'published' ? 'Update live article' : isNew ? 'Save draft' : 'Save',
    icon: <SaveRoundedIcon />,
    onClick: onSave,
    variant: 'contained',
  };
  const publishNow: PanelAction = { label: 'Publish now', icon: <PublishRoundedIcon />, onClick: () => onStatus('published'), variant: 'contained', color: 'success' };
  const schedule: PanelAction = { label: article.status === 'scheduled' ? 'Change date' : 'Schedule…', icon: <EventRoundedIcon />, onClick: onSchedule, variant: 'outlined', color: 'info' };
  const toDraft: PanelAction = { label: 'Back to draft', icon: <UnpublishedRoundedIcon />, onClick: () => onStatus('draft'), variant: 'outlined', color: 'inherit' };

  const byStatus: Record<ArticleStatus, PanelAction[]> = {
    draft: [save, { label: 'Submit for review', icon: <RateReviewRoundedIcon />, onClick: () => onStatus('in_review'), variant: 'outlined', color: 'warning' }, publishNow, schedule],
    in_review: [save, { ...publishNow, label: 'Approve & publish' }, schedule, { ...toDraft, label: 'Request changes' }],
    scheduled: [save, schedule, publishNow, { ...toDraft, label: 'Unschedule' }],
    published: [save, { ...toDraft, label: 'Unpublish' }, { label: 'Archive', icon: <ArchiveRoundedIcon />, onClick: () => onStatus('archived'), variant: 'outlined', color: 'inherit' }],
    archived: [{ label: 'Restore to draft', icon: <UnpublishedRoundedIcon />, onClick: () => onStatus('draft'), variant: 'contained' }],
  };

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return (
    <Card>
      <CardHeader title="Publishing" action={<StatusChip status={article.status} />} />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {STATUS_META[article.status].description}
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2, fontSize: 13 }}>
          {article.status === 'scheduled' && article.scheduledAt && (
            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 600 }}>
              Goes live {formatDateTime(article.scheduledAt)} ({formatRelative(article.scheduledAt)})
            </Typography>
          )}
          {article.publishedAt && (
            <Typography variant="body2">
              Published: <strong>{formatDateTime(article.publishedAt)}</strong>
            </Typography>
          )}
          {!isNew && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Last saved {formatRelative(article.updatedAt)}
              {dirty && (
                <Typography component="span" variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                  {' '}
                  · unsaved changes
                </Typography>
              )}
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          {byStatus[article.status].map((action) => (
            <Button
              key={action.label}
              fullWidth
              startIcon={action.icon}
              variant={action.variant ?? 'outlined'}
              color={action.color ?? 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Publishing checklist
        </Typography>
        {issues.length === 0 ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'success.main', mt: 0.5 }}>
            <CheckCircleRoundedIcon fontSize="small" />
            <Typography variant="body2">Ready to publish</Typography>
          </Stack>
        ) : (
          <List dense disablePadding>
            {[...errors, ...warnings].map((issue) => (
              <ListItem key={issue.message} disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                  {issue.severity === 'error' ? <ErrorRoundedIcon fontSize="small" color="error" /> : <WarningRoundedIcon fontSize="small" color="warning" />}
                </ListItemIcon>
                <ListItemText primary={issue.message} slotProps={{ primary: { sx: { fontSize: 13 } } }} />
              </ListItem>
            ))}
          </List>
        )}

        {!isNew && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={onDuplicate} color="inherit">
                Duplicate
              </Button>
              <Button size="small" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete} color="error">
                Delete
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
