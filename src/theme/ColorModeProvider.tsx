import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ColorModeContext } from './colorModeContext';
import { createAppTheme } from './theme';

const STORAGE_KEY = 'newsroom-dashboard/color-mode';

function readStoredMode(): PaletteMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/** Provides the MUI theme and a light/dark switch that follows the OS until the user chooses. */
export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [storedMode, setStoredMode] = useState<PaletteMode | null>(readStoredMode);
  const mode: PaletteMode = storedMode ?? (prefersDark ? 'dark' : 'light');

  useEffect(() => {
    if (!storedMode) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, storedMode);
    } catch {
      // Ignore – the preference simply will not be remembered.
    }
  }, [storedMode]);

  const toggleMode = useCallback(() => setStoredMode(mode === 'dark' ? 'light' : 'dark'), [mode]);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
