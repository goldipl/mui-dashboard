import type { AlertColor } from '@mui/material/Alert';
import { createContext, useContext } from 'react';

export type NotifyFn = (message: string, severity?: AlertColor) => void;

export const NotificationContext = createContext<NotifyFn>(() => {});

/** Returns a function that shows a toast notification. */
export function useNotify(): NotifyFn {
  return useContext(NotificationContext);
}
