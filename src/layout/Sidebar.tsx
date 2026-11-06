import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { NavLink } from 'react-router';
import { UserAvatar } from '../components/UserAvatar';
import { useNewsroom } from '../store/useNewsroom';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '../theme/theme';
import { NAVIGATION } from './navigation';

interface SidebarProps {
  isDesktop: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

function Logo({ compact }: { compact: boolean }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: compact ? 0 : 1, justifyContent: compact ? 'center' : 'flex-start' }}>
      <Box
        component="img"
        src="/favicon.svg"
        alt=""
        sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0 }}
      />
      {!compact && (
        <div>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>Newsroom</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Editorial dashboard
          </Typography>
        </div>
      )}
    </Stack>
  );
}

export function Sidebar({ isDesktop, collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {
  const { state } = useNewsroom();
  const compact = isDesktop && collapsed;
  const width = compact ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const badges = useMemo(
    () => ({
      review: state.articles.filter((article) => article.status === 'in_review').length,
      processing: state.videos.filter((video) => video.status === 'processing').length,
    }),
    [state.articles, state.videos],
  );

  const content = (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 2, minHeight: 64, display: 'flex', alignItems: 'center' }}>
        <Logo compact={compact} />
      </Box>
      <Divider />
      <Box component="nav" aria-label="Main navigation" sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1 }}>
        {NAVIGATION.map((section) => (
          <List
            key={section.title}
            dense
            subheader={
              compact ? (
                <Divider sx={{ my: 1 }} />
              ) : (
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '32px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {section.title}
                </ListSubheader>
              )
            }
          >
            {section.items.map((item) => {
              const count = item.badge ? badges[item.badge] : 0;
              const icon = (
                <Badge color={item.badge === 'review' ? 'warning' : 'info'} badgeContent={count} invisible={!compact || count === 0}>
                  {item.icon}
                </Badge>
              );
              const button = (
                <ListItemButton
                  component={NavLink}
                  to={item.to}
                  end={item.end}
                  onClick={isDesktop ? undefined : onCloseMobile}
                  sx={{ mb: 0.5, minHeight: 42, justifyContent: compact ? 'center' : 'flex-start', px: compact ? 1 : 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: compact ? 0 : 38 }}>{icon}</ListItemIcon>
                  {!compact && (
                    <>
                      <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } } }} />
                      {count > 0 && (
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            borderRadius: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            bgcolor: item.badge === 'review' ? 'warning.main' : 'info.main',
                            color: 'common.white',
                          }}
                        >
                          {count}
                        </Box>
                      )}
                    </>
                  )}
                </ListItemButton>
              );
              return compact ? (
                <Tooltip key={item.to} title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                <Box key={item.to}>{button}</Box>
              );
            })}
          </List>
        ))}
      </Box>
      <Divider />
      <Stack direction="row" spacing={1.5} sx={{ p: 2, alignItems: 'center', justifyContent: compact ? 'center' : 'space-between' }}>
        {!compact && (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
            <UserAvatar name={state.profile.name} size={36} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                {state.profile.name}
              </Typography>
              <Typography variant="caption" noWrap component="p" sx={{ color: 'text.secondary' }}>
                {state.profile.role}
              </Typography>
            </Box>
          </Stack>
        )}
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton size="small" onClick={onToggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );

  if (!isDesktop) {
    return (
      <Drawer variant="temporary" open={mobileOpen} onClose={onCloseMobile} slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}>
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: (theme) => theme.transitions.create('width'),
      }}
      slotProps={{
        paper: {
          sx: {
            width,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width'),
          },
        },
      }}
    >
      {content}
    </Drawer>
  );
}
