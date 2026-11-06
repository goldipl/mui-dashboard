import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Suspense, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const COLLAPSED_KEY = 'newsroom-dashboard/sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Application shell: sidebar navigation, top bar and the routed page. */
export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1');
      } catch {
        // Ignore – preference will not be remembered.
      }
      return !value;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isDesktop={isDesktop}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar isDesktop={isDesktop} onOpenMobileNav={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 1600, width: '100%', mx: 'auto' }}>
          <Suspense fallback={<LinearProgress sx={{ borderRadius: 1 }} />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
      <ScrollRestoration />
    </Box>
  );
}
