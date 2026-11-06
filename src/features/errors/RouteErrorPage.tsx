import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { isRouteErrorResponse, useRouteError } from 'react-router';

/** Rendered by the router when a page throws during rendering. */
export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <Stack spacing={2} sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
      <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 56 }} />
      <Typography variant="h4" component="h1">
        Something went wrong
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: 520 }}>{message}</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" href="/">
          Back to dashboard
        </Button>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </Stack>
    </Stack>
  );
}
