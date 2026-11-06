import { describe, expect, it } from 'vitest';
import { createSeedData } from './seed';
import { SITES } from './sites';

const NOW = new Date('2026-11-06T10:00:00Z').getTime();

describe('createSeedData', () => {
  it('is deterministic for the same reference time', () => {
    expect(createSeedData(NOW)).toEqual(createSeedData(NOW));
  });

  it('creates articles for every site and every workflow status', () => {
    const { articles } = createSeedData(NOW);
    expect(articles.length).toBe(150);
    for (const site of SITES) {
      expect(articles.some((a) => a.siteId === site.id)).toBe(true);
    }
    const statuses = new Set(articles.map((a) => a.status));
    expect([...statuses].sort()).toEqual(['archived', 'draft', 'in_review', 'published', 'scheduled']);
  });

  it('keeps references between articles and photos valid', () => {
    const { articles, photos } = createSeedData(NOW);
    const photoIds = new Set(photos.map((p) => p.id));
    for (const article of articles) {
      if (article.featuredImageId) expect(photoIds.has(article.featuredImageId)).toBe(true);
      expect(SITES.find((s) => s.id === article.siteId)?.categories).toContain(article.category);
    }
  });

  it('schedules future articles only', () => {
    const { articles } = createSeedData(NOW);
    for (const article of articles.filter((a) => a.status === 'scheduled')) {
      expect(new Date(article.scheduledAt!).getTime()).toBeGreaterThan(NOW);
    }
  });
});
