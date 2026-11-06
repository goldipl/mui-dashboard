import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserAvatar } from '../components/UserAvatar';
import { useNotify } from '../hooks/useNotify';
import { useNewsroom } from '../store/useNewsroom';
import { useColorMode } from '../theme/colorModeContext';
import { formatRelative } from '../utils/format';

const LAST_SEEN_KEY = 'newsroom-dashboard/notifications-seen';

function readLastSeen(): string {
  try {
    return window.localStorage.getItem(LAST_SEEN_KEY) ?? '';
  } catch {
    return '';
  }
}

interface TopBarProps {
  isDesktop: boolean;
  onOpenMobileNav: () => void;
}

export function TopBar({ isDesktop, onOpenMobileNav }: TopBarProps) {
  const navigate = useNavigate();
  const notify = useNotify();
  const { mode, toggleMode } = useColorMode();
  const { state, actions } = useNewsroom();
  const [search, setSearch] = useState('');
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(readLastSeen);

  const recent = state.activity.slice(0, 8);
  const unread = recent.filter((event) => event.at > lastSeen).length;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
  };

  const openNotifications = (target: HTMLElement) => {
    setNotificationsAnchor(target);
    const newest = recent[0]?.at ?? '';
    setLastSeen(newest);
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, newest);
    } catch {
      // Ignore – unread state is only a convenience.
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64 } }}>
        {!isDesktop && (
          <IconButton edge="start" onClick={onOpenMobileNav} aria-label="Open navigation">
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box
          component="form"
          role="search"
          onSubmit={handleSearch}
          sx={(theme) => ({
            // On phones there is no room for a usable field; a search icon opens the Articles page instead.
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            height: 40,
            flex: 1,
            maxWidth: 440,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.primary, 0.05),
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <InputBase
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles…"
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ 'aria-label': 'Search articles' }}
          />
        </Box>
        <IconButton onClick={() => navigate('/articles')} aria-label="Search articles" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <SearchRoundedIcon />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {isDesktop && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<BoltRoundedIcon />}
              onClick={() => navigate('/publisher/articles/new?priority=breaking')}
            >
              Breaking
            </Button>
          )}
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/publisher/articles/new')}>
            {isDesktop ? 'New article' : 'New'}
          </Button>

          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleMode} aria-label="Toggle colour mode">
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={(event) => openNotifications(event.currentTarget)} aria-label="Show notifications">
              <Badge badgeContent={unread} color="error" max={9}>
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={(event) => setUserAnchor(event.currentTarget)} aria-label="Open user menu" sx={{ p: 0.5 }}>
            <UserAvatar name={state.profile.name} size={34} />
          </IconButton>
        </Stack>
      </Toolbar>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Typography sx={{ px: 2, py: 1, fontWeight: 700 }}>Recent activity</Typography>
        <Divider />
        {recent.map((event) => (
          <MenuItem
            key={event.id}
            onClick={() => {
              setNotificationsAnchor(null);
              if (event.articleId && state.articles.some((article) => article.id === event.articleId)) {
                navigate(`/publisher/articles/${event.articleId}`);
              }
            }}
            sx={{ whiteSpace: 'normal', alignItems: 'flex-start', py: 1.25 }}
          >
            <ListItemText
              primary={event.message}
              secondary={formatRelative(event.at)}
              slotProps={{ primary: { sx: { fontSize: 13.5 } } }}
            />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setNotificationsAnchor(null);
            navigate('/profile?tab=activity');
          }}
          sx={{ justifyContent: 'center', fontWeight: 600, color: 'primary.main' }}
        >
          View all activity
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 240 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>{state.profile.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {state.profile.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setUserAnchor(null);
            navigate('/profile');
          }}
        >
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          My profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setUserAnchor(null);
            setResetOpen(true);
          }}
        >
          <ListItemIcon>
            <RestartAltRoundedIcon fontSize="small" />
          </ListItemIcon>
          Reset demo data
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setUserAnchor(null);
            notify('Signing out is disabled in the demo.', 'info');
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        description="All articles, media and profile changes stored in this browser will be replaced with the original demo data."
        confirmLabel="Reset"
        destructive
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          actions.resetDemoData();
          notify('Demo data has been reset.');
          navigate('/');
        }}
      />
    </AppBar>
  );
}
