import type { PaletteMode } from '@mui/material/styles';
import { createContext, useContext } from 'react';

export interface ColorModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>({ mode: 'light', toggleMode: () => {} });

export function useColorMode(): ColorModeContextValue {
  return useContext(ColorModeContext);
}
