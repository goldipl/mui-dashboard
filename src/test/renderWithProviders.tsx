import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { NotificationProvider } from '../components/NotificationProvider';
import { createSeedData } from '../data/seed';
import { NewsroomProvider } from '../store/NewsroomProvider';
import { STATE_VERSION, type NewsroomState } from '../store/reducer';
import { ColorModeProvider } from '../theme/ColorModeProvider';

/** Fixed reference time so seeded data is identical in every test run. */
export const TEST_NOW = new Date('2026-11-06T10:00:00Z').getTime();

export function createTestState(): NewsroomState {
  return { version: STATE_VERSION, ...createSeedData(TEST_NOW) };
}

interface Options {
  route?: string;
  path?: string;
  state?: NewsroomState;
}

/** Renders a component inside all application providers and a memory router. */
export function renderWithProviders(ui: ReactElement, { route = '/', path = '/', state = createTestState() }: Options = {}) {
  const router = createMemoryRouter([{ path, element: ui }], { initialEntries: [route] });
  const result = render(
    <ColorModeProvider>
      <NotificationProvider>
        <NewsroomProvider initialState={state} disablePersistence>
          <RouterProvider router={router} />
        </NewsroomProvider>
      </NotificationProvider>
    </ColorModeProvider>,
  );
  return { ...result, router, state };
}
