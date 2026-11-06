import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { RouteErrorPage } from '../features/errors/RouteErrorPage';
import { AppLayout } from '../layout/AppLayout';

// Pages are code-split so the charts and data grid are only loaded when needed.
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const ArticlesPage = lazy(() => import('../features/articles/ArticlesPage'));
const SitesPage = lazy(() => import('../features/sites/SitesPage'));
const PhotosPage = lazy(() => import('../features/photos/PhotosPage'));
const VideosPage = lazy(() => import('../features/videos/VideosPage'));
const PublisherPage = lazy(() => import('../features/publisher/PublisherPage'));
const ArticleEditorPage = lazy(() => import('../features/publisher/editor/ArticleEditorPage'));
const NotFoundPage = lazy(() => import('../features/errors/NotFoundPage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'sites', element: <Navigate to="/sites/herald" replace /> },
      { path: 'sites/:siteId', element: <SitesPage /> },
      { path: 'media', element: <Navigate to="/media/photos" replace /> },
      { path: 'media/photos', element: <PhotosPage /> },
      { path: 'media/videos', element: <VideosPage /> },
      { path: 'publisher', element: <PublisherPage /> },
      { path: 'publisher/articles/new', element: <ArticleEditorPage /> },
      { path: 'publisher/articles/:articleId', element: <ArticleEditorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
