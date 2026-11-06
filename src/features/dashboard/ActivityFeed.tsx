import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { Link as RouterLink } from 'react-router';
import { ActivityTimeline } from '../../components/ActivityTimeline';
import type { ActivityEvent } from '../../types';

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Recent activity"
        subheader="What the newsroom is working on"
        action={
          <Button size="small" component={RouterLink} to="/profile?tab=activity">
            More
          </Button>
        }
      />
      <Box sx={{ px: 2.5, pb: 1 }}>
        <ActivityTimeline events={events} />
      </Box>
    </Card>
  );
}
