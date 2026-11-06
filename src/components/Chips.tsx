import Chip, { type ChipProps } from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { getSite } from '../data/sites';
import type { ArticlePriority, ArticleStatus, SiteId } from '../types';
import { PRIORITY_META, STATUS_META } from '../utils/workflow';

type BaseProps = Omit<ChipProps, 'label' | 'color'>;

export function StatusChip({ status, ...props }: BaseProps & { status: ArticleStatus }) {
  const meta = STATUS_META[status];
  return <Chip size="small" label={meta.label} color={meta.color} variant={status === 'draft' ? 'outlined' : 'filled'} {...props} />;
}

export function PriorityChip({ priority, ...props }: BaseProps & { priority: ArticlePriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Chip
      size="small"
      variant={priority === 'breaking' ? 'filled' : 'outlined'}
      color={meta.color}
      icon={priority === 'breaking' ? <BoltRoundedIcon /> : undefined}
      label={meta.label}
      {...props}
    />
  );
}

/** Chip coloured with the brand colour of a site. */
export function SiteChip({ siteId, short = false, sx, ...props }: BaseProps & { siteId: SiteId; short?: boolean }) {
  const site = getSite(siteId);
  return (
    <Chip
      size="small"
      label={short ? site.name.replace(/^The /, '') : site.name}
      sx={[
        { bgcolor: alpha(site.color, 0.14), color: site.color, border: `1px solid ${alpha(site.color, 0.3)}` },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
