import Alert, { type AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCallback, useState, type ReactNode } from 'react';
import { NotificationContext } from '../hooks/useNotify';

interface Toast {
  key: number;
  message: string;
  severity: AlertColor;
}

/** Shows one toast at a time; a new toast replaces the current one. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ key: Date.now(), message, severity });
    setOpen(true);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={3500}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpen(false)} severity={toast?.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
