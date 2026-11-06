import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  /** Key used to show a counter badge next to the item. */
  badge?: 'review' | 'processing';
  end?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: <DashboardRoundedIcon />, end: true }],
  },
  {
    title: 'Content',
    items: [
      { label: 'Articles', to: '/articles', icon: <ArticleRoundedIcon /> },
      { label: 'Sites', to: '/sites', icon: <LanguageRoundedIcon /> },
      { label: 'Publisher', to: '/publisher', icon: <RateReviewRoundedIcon />, badge: 'review' },
    ],
  },
  {
    title: 'Media',
    items: [
      { label: 'Photos', to: '/media/photos', icon: <PhotoLibraryRoundedIcon /> },
      { label: 'Videos', to: '/media/videos', icon: <VideoLibraryRoundedIcon />, badge: 'processing' },
    ],
  },
  {
    title: 'Account',
    items: [{ label: 'My profile', to: '/profile', icon: <PersonRoundedIcon /> }],
  },
];
