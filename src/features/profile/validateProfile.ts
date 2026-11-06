import type { EditorProfile } from '../../types';

export type ProfileErrors = Partial<Record<'name' | 'email' | 'phone' | 'bio' | 'siteIds', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;
export const BIO_MAX = 400;

export function validateProfile(profile: EditorProfile): ProfileErrors {
  const errors: ProfileErrors = {};
  if (profile.name.trim().length < 3) errors.name = 'Name must have at least 3 characters.';
  if (!EMAIL_PATTERN.test(profile.email)) errors.email = 'Enter a valid email address.';
  if (profile.phone && !PHONE_PATTERN.test(profile.phone)) errors.phone = 'Enter a valid phone number.';
  if (profile.bio.length > BIO_MAX) errors.bio = `Bio cannot be longer than ${BIO_MAX} characters.`;
  if (profile.siteIds.length === 0) errors.siteIds = 'Select at least one site.';
  return errors;
}
