import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../components/NotificationProvider';
import { NewsroomProvider } from '../store/NewsroomProvider';
import { createTestState } from '../test/renderWithProviders';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { routes } from './routes';

const state = createTestState();
const firstArticle = state.articles[0];

const CASES: [path: string, heading: RegExp][] = [
  ['/', /good (morning|afternoon|evening), morgan/i],
  ['/articles', /^articles$/i],
  ['/articles?status=published&site=tech', /^articles$/i],
  ['/sites/sport', /^sites$/i],
  ['/media/photos', /^photos$/i],
  ['/media/videos', /^videos$/i],
  ['/publisher', /^publisher$/i],
  ['/publisher/articles/new', /^new article$/i],
  ['/publisher/articles/new?priority=breaking', /^breaking news$/i],
  [`/publisher/articles/${firstArticle.id}`, /^edit article$/i],
  ['/profile', /^my profile$/i],
  ['/profile?tab=settings', /^my profile$/i],
  ['/this-page-does-not-exist', /page not found/i],
];

describe('routes smoke test', () => {
  let errors: unknown[][] = [];

  beforeEach(() => {
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(CASES)('renders %s without errors', async (path, heading) => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
      <ColorModeProvider>
        <NotificationProvider>
          <NewsroomProvider initialState={state} disablePersistence>
            <RouterProvider router={router} />
          </NewsroomProvider>
        </NotificationProvider>
      </ColorModeProvider>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: heading }, { timeout: 5000 })).toBeInTheDocument();
    expect(errors.map((args) => String(args[0]))).toEqual([]);
  });
});
