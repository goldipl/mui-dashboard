import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  /** Heading element for the title – use `h1` when the empty state is the whole page. */
  titleComponent?: ElementType;
}

export function EmptyState({ title, description, icon, action, titleComponent = 'h2' }: EmptyStateProps) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, color: 'text.secondary' }}>
      <Stack sx={{ fontSize: 48, color: 'text.disabled', '& svg': { fontSize: 'inherit' } }}>
        {icon ?? <InboxRoundedIcon />}
      </Stack>
      <Typography variant="h6" component={titleComponent} sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {action && <Stack sx={{ pt: 1 }}>{action}</Stack>}
    </Stack>
  );
}
