import { createBrowserRouter, RouterProvider } from 'react-router';
import { NotificationProvider } from '../components/NotificationProvider';
import { NewsroomProvider } from '../store/NewsroomProvider';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { routes } from './routes';

// Vite exposes the configured `base` (e.g. `/mui-dashboard/` on GitHub Pages) as BASE_URL.
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export function App() {
  return (
    <ColorModeProvider>
      <NotificationProvider>
        <NewsroomProvider>
          <RouterProvider router={router} />
        </NewsroomProvider>
      </NotificationProvider>
    </ColorModeProvider>
  );
}
