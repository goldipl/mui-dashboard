import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';
import { ActivityTimeline } from '../../components/ActivityTimeline';
import { EmptyState } from '../../components/EmptyState';
import type { ActivityEvent } from '../../types';

export function ProfileActivity({ events, userId }: { events: ActivityEvent[]; userId: string }) {
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const visible = scope === 'mine' ? events.filter((event) => event.actorId === userId) : events;

  return (
    <Card>
      <CardHeader
        title="Activity log"
        subheader={`${visible.length} events`}
        action={
          <ToggleButtonGroup size="small" exclusive value={scope} onChange={(_, value) => value && setScope(value)}>
            <ToggleButton value="mine">Mine</ToggleButton>
            <ToggleButton value="all">Whole newsroom</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <Box sx={{ px: 3, pb: 2, maxHeight: 720, overflowY: 'auto' }}>
        {visible.length === 0 ? (
          <EmptyState title="No activity yet" description="Your actions in the dashboard will appear here." />
        ) : (
          <ActivityTimeline events={visible} />
        )}
      </Box>
    </Card>
  );
}
