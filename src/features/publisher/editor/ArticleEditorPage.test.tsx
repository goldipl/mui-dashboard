import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../app/routes';
import { NotificationProvider } from '../../../components/NotificationProvider';
import { NewsroomProvider } from '../../../store/NewsroomProvider';
import { createTestState } from '../../../test/renderWithProviders';
import { ColorModeProvider } from '../../../theme/ColorModeProvider';

function renderAt(path: string) {
  const state = createTestState();
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
  return { router, state };
}

describe('<ArticleEditorPage />', () => {
  it('creates a draft and switches to the edit URL', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/publisher/articles/new');

    const headline = await screen.findByRole('textbox', { name: 'Headline' }, { timeout: 8000 });
    await user.click(headline);
    await user.paste('City council approves new cycling lanes');
    expect(screen.getByLabelText(/url slug/i)).toHaveValue('city-council-approves-new-cycling-lanes');

    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Edit article' })).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/publisher\/articles\/art-/);
    expect(screen.getByText('Draft created.')).toBeInTheDocument();
  });

  it('refuses to publish an incomplete article', async () => {
    const user = userEvent.setup();
    renderAt('/publisher/articles/new');

    await user.click(await screen.findByRole('textbox', { name: 'Headline' }, { timeout: 8000 }));
    await user.paste('Too short body');
    await user.click(screen.getByRole('button', { name: 'Publish now' }));

    expect(await screen.findByText('Fix the errors in the publishing checklist first.')).toBeInTheDocument();
    expect(screen.getByText('Body must contain at least 50 words.')).toBeInTheDocument();
  });

  it('asks for confirmation before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    // Seed data is deterministic, so the id is known before rendering.
    const { router, state } = renderAt(`/publisher/articles/${createTestState().articles[0].id}`);

    const headline = await screen.findByRole('textbox', { name: 'Headline' }, { timeout: 8000 });
    await user.click(headline);
    await user.paste(' (updated)');
    await user.click(screen.getAllByRole('link', { name: 'Publisher' })[0]);

    expect(await screen.findByText('Leave without saving?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    await waitFor(() => expect(screen.queryByText('Leave without saving?')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe(`/publisher/articles/${state.articles[0].id}`);
  });
});
