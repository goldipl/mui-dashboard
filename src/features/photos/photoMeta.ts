import type { PhotoLicense } from '../../types';

export const LICENSE_LABELS: Record<PhotoLicense, string> = {
  editorial: 'Editorial use only',
  royalty_free: 'Royalty free',
  rights_managed: 'Rights managed',
  creative_commons: 'Creative Commons',
};

export const LICENSES = Object.keys(LICENSE_LABELS) as PhotoLicense[];
