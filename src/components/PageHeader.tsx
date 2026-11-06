import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

/** Page title, breadcrumbs and primary actions. Also sets `document.title`. */
export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  useDocumentTitle(title);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ mb: 3, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between' }}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 0.5, fontSize: 13 }}>
            {breadcrumbs.map((crumb) =>
              crumb.to ? (
                <Link key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="inherit">
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} sx={{ fontSize: 13, color: 'text.primary' }}>
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, '& > *': { m: '0 !important' } }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
