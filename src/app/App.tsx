import { createBrowserRouter, RouterProvider } from 'react-router';
import { NotificationProvider } from '../components/NotificationProvider';
import { NewsroomProvider } from '../store/NewsroomProvider';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { routes } from './routes';

const router = createBrowserRouter(routes);

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
