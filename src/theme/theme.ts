import { alpha, createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

export const DRAWER_WIDTH = 264;
export const DRAWER_WIDTH_COLLAPSED = 76;

/** Serif face used for headlines in article previews. */
export const HEADLINE_FONT = '"Merriweather", Georgia, serif';

/** Builds the application theme for the given colour mode. */
export function createAppTheme(mode: PaletteMode): Theme {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#7c9cff' : '#1f4fd8' },
      secondary: { main: isDark ? '#f472b6' : '#be185d' },
      error: { main: isDark ? '#f87171' : '#d32f2f' },
      background: isDark ? { default: '#0d1117', paper: '#151b23' } : { default: '#f4f6fa', paper: '#ffffff' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      text: isDark ? { primary: '#e6edf3', secondary: '#9aa7b4' } : { primary: '#0f172a', secondary: '#526075' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontWeight: 800, fontSize: '2.25rem' },
      h2: { fontWeight: 800, fontSize: '1.9rem' },
      h3: { fontWeight: 700, fontSize: '1.6rem' },
      h4: { fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' },
      h5: { fontWeight: 700, fontSize: '1.15rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      subtitle2: { fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
  });

  return createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { scrollbarGutter: 'stable' },
          '::selection': { backgroundColor: alpha(theme.palette.primary.main, 0.25) },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: 14 } },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { paddingBottom: 8 },
          title: { fontSize: '1rem', fontWeight: 700 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: { paper: { borderRight: `1px solid ${theme.palette.divider}` } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.active': {
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
              color: theme.palette.primary.main,
              '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 48 } },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 700 } },
      },
    },
  });
}
