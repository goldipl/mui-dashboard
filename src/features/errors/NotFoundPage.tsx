import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      icon={<TravelExploreRoundedIcon />}
      titleComponent="h1"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      action={
        <Button variant="contained" component={RouterLink} to="/">
          Go to dashboard
        </Button>
      }
    />
  );
}
