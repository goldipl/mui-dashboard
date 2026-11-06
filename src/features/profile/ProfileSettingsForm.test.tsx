import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createTestState, renderWithProviders } from '../../test/renderWithProviders';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { validateProfile } from './validateProfile';

describe('validateProfile', () => {
  it('accepts the seeded profile', () => {
    expect(validateProfile(createTestState().profile)).toEqual({});
  });

  it('reports invalid fields', () => {
    const profile = { ...createTestState().profile, name: 'A', email: 'nope', siteIds: [] };
    expect(Object.keys(validateProfile(profile)).sort()).toEqual(['email', 'name', 'siteIds']);
  });
});

describe('<ProfileSettingsForm />', () => {
  it('keeps the save button disabled until something changes', async () => {
    const state = createTestState();
    renderWithProviders(<ProfileSettingsForm profile={state.profile} />, { state });

    const save = await screen.findByRole('button', { name: /save profile/i });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/location/i), ' – newsroom');
    expect(save).toBeEnabled();
  });

  it('shows validation errors and does not save invalid data', async () => {
    const state = createTestState();
    renderWithProviders(<ProfileSettingsForm profile={state.profile} />, { state });

    const email = await screen.findByLabelText(/^email/i);
    await userEvent.clear(email);
    await userEvent.type(email, 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Please fix the highlighted fields.')).toBeInTheDocument();
  });
});
