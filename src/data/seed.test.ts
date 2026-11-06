import { describe, expect, it } from 'vitest';
import { buildHeadline, createSeedData } from './seed';
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

  it('builds headlines with subject–verb agreement', () => {
    expect(buildHeadline('Basketball champions', 'targets', 'a new season')).toBe('Basketball champions target a new season');
    expect(buildHeadline('Veteran striker', 'targets', 'a new season')).toBe('Veteran striker targets a new season');
    expect(buildHeadline('Title favourites', 'clinches', 'the cup')).toBe('Title favourites clinch the cup');
    expect(buildHeadline('Researchers', 'misses out on', 'funding')).toBe('Researchers miss out on funding');
    expect(buildHeadline('Regulators', 'releases', 'new rules')).toBe('Regulators release new rules');
  });

  it('publishes articles recently and never in the future', () => {
    const { articles } = createSeedData(NOW);
    const published = articles.filter((a) => a.publishedAt);
    expect(published.every((a) => new Date(a.publishedAt!).getTime() <= NOW)).toBe(true);
    expect(published.some((a) => NOW - new Date(a.publishedAt!).getTime() < 24 * 3_600_000)).toBe(true);
  });

  it('schedules future articles only', () => {
    const { articles } = createSeedData(NOW);
    for (const article of articles.filter((a) => a.status === 'scheduled')) {
      expect(new Date(article.scheduledAt!).getTime()).toBeGreaterThan(NOW);
    }
  });
});
