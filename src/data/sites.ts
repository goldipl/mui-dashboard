import type { Author, Site, SiteId } from '../types';

/** Publications managed by the newsroom. Domains use the reserved `.example` TLD. */
export const SITES: Site[] = [
  {
    id: 'herald',
    name: 'The Daily Herald',
    domain: 'dailyherald.example',
    description: 'National and world news, politics and opinion.',
    color: '#1f4fd8',
    categories: ['Politics', 'World', 'Economy', 'Society', 'Opinion'],
  },
  {
    id: 'sport',
    name: 'Sport Today',
    domain: 'sporttoday.example',
    description: 'Live scores, match reports and transfer news.',
    color: '#15803d',
    categories: ['Football', 'Basketball', 'Tennis', 'Motorsport', 'Athletics'],
  },
  {
    id: 'tech',
    name: 'Tech Pulse',
    domain: 'techpulse.example',
    description: 'Technology, science and the digital economy.',
    color: '#7c3aed',
    categories: ['AI', 'Gadgets', 'Startups', 'Security', 'Science'],
  },
  {
    id: 'business',
    name: 'Market Wire',
    domain: 'marketwire.example',
    description: 'Markets, companies and personal finance.',
    color: '#b45309',
    categories: ['Markets', 'Companies', 'Finance', 'Energy', 'Real Estate'],
  },
  {
    id: 'lifestyle',
    name: 'Living & Style',
    domain: 'livingstyle.example',
    description: 'Health, travel, food and culture.',
    color: '#be185d',
    categories: ['Health', 'Travel', 'Food', 'Culture', 'Fashion'],
  },
];

const SITE_MAP = new Map(SITES.map((site) => [site.id, site]));

export function getSite(id: SiteId): Site {
  const site = SITE_MAP.get(id);
  if (!site) throw new Error(`Unknown site: ${id}`);
  return site;
}

export function isSiteId(value: string | undefined): value is SiteId {
  return value !== undefined && SITE_MAP.has(value as SiteId);
}

/** Id of the signed-in editor. */
export const CURRENT_USER_ID = 'u-001';

export const AUTHORS: Author[] = [
  { id: 'u-001', name: 'Morgan Blake', role: 'Senior Editor', email: 'morgan.blake@newsroom.example', siteIds: ['herald', 'business', 'tech'] },
  { id: 'u-002', name: 'Priya Nair', role: 'Editor-in-Chief', email: 'priya.nair@newsroom.example', siteIds: ['herald', 'sport', 'tech', 'business', 'lifestyle'] },
  { id: 'u-003', name: 'Tomasz Wrona', role: 'Reporter', email: 'tomasz.wrona@newsroom.example', siteIds: ['sport'] },
  { id: 'u-004', name: 'Emily Carter', role: 'Editor', email: 'emily.carter@newsroom.example', siteIds: ['lifestyle', 'herald'] },
  { id: 'u-005', name: 'Lucas Ferreira', role: 'Reporter', email: 'lucas.ferreira@newsroom.example', siteIds: ['tech', 'business'] },
  { id: 'u-006', name: 'Hannah Schmidt', role: 'Photo Editor', email: 'hannah.schmidt@newsroom.example', siteIds: ['herald', 'lifestyle'] },
  { id: 'u-007', name: 'Daniel Okafor', role: 'Video Producer', email: 'daniel.okafor@newsroom.example', siteIds: ['sport', 'tech'] },
  { id: 'u-008', name: 'Sofia Rossi', role: 'Reporter', email: 'sofia.rossi@newsroom.example', siteIds: ['business', 'herald'] },
];
