import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { useState } from 'react';
import { fromDateTimeLocal, toDateTimeLocal } from '../../utils/format';

interface ScheduleDialogProps {
  open: boolean;
  initialValue?: string;
  title?: string;
  onClose: () => void;
  onConfirm: (iso: string) => void;
}

function nextFullHour(): string {
  return dayjs().add(1, 'hour').startOf('hour').toISOString();
}

const PRESETS: { label: string; value: () => string }[] = [
  { label: 'In 1 hour', value: () => dayjs().add(1, 'hour').toISOString() },
  { label: 'Tonight 20:00', value: () => dayjs().hour(20).minute(0).second(0).toISOString() },
  { label: 'Tomorrow 07:00', value: () => dayjs().add(1, 'day').hour(7).minute(0).second(0).toISOString() },
  { label: 'Tomorrow 12:00', value: () => dayjs().add(1, 'day').hour(12).minute(0).second(0).toISOString() },
];

/** Picks a future publication date for an article. */
export function ScheduleDialog({ open, initialValue, title = 'Schedule publication', onClose, onConfirm }: ScheduleDialogProps) {
  const [value, setValue] = useState(() => toDateTimeLocal(initialValue ?? nextFullHour()));
  const iso = fromDateTimeLocal(value);
  const isFuture = iso ? dayjs(iso).isAfter(dayjs()) : false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        transition: {
          onEnter: () => {
            const initial = initialValue && dayjs(initialValue).isAfter(dayjs()) ? initialValue : nextFullHour();
            setValue(toDateTimeLocal(initial));
          },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>The article will be published automatically at the selected time.</DialogContentText>
        <TextField
          type="datetime-local"
          label="Publication date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          error={Boolean(value) && !isFuture}
          helperText={value && !isFuture ? 'Choose a date in the future.' : ' '}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: toDateTimeLocal(new Date().toISOString()) } }}
        />
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {PRESETS.map((preset) => (
            <Chip key={preset.label} label={preset.label} onClick={() => setValue(toDateTimeLocal(preset.value()))} variant="outlined" />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!iso || !isFuture}
          onClick={() => {
            if (iso) onConfirm(iso);
          }}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
}
