import { describe, expect, it } from 'vitest';
import { createTestState } from '../../test/renderWithProviders';
import { articlesToCsv, DEFAULT_FILTERS, filterArticles } from './filterArticles';

const { articles } = createTestState();

describe('filterArticles', () => {
  it('returns everything with default filters', () => {
    expect(filterArticles(articles, DEFAULT_FILTERS)).toHaveLength(articles.length);
  });

  it('filters by status, site, author and priority', () => {
    const result = filterArticles(articles, { ...DEFAULT_FILTERS, status: 'published', siteId: 'sport' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.status === 'published' && a.siteId === 'sport')).toBe(true);

    const byAuthor = filterArticles(articles, { ...DEFAULT_FILTERS, authorId: 'u-003' });
    expect(byAuthor.every((a) => a.authorId === 'u-003')).toBe(true);
  });

  it('searches headline, tags and author name case-insensitively', () => {
    const target = articles[10];
    const byTitle = filterArticles(articles, { ...DEFAULT_FILTERS, query: target.title.toUpperCase() });
    expect(byTitle.map((a) => a.id)).toContain(target.id);

    const byAuthor = filterArticles(articles, { ...DEFAULT_FILTERS, query: 'tomasz' });
    expect(byAuthor.length).toBeGreaterThan(0);
    expect(byAuthor.every((a) => a.authorId === 'u-003')).toBe(true);
  });

  it('can ignore selected facets (used for tab counters)', () => {
    const filters = { ...DEFAULT_FILTERS, status: 'draft' as const, siteId: 'tech' as const };
    const ignoringStatus = filterArticles(articles, filters, ['status']);
    expect(ignoringStatus.every((a) => a.siteId === 'tech')).toBe(true);
    expect(ignoringStatus.some((a) => a.status !== 'draft')).toBe(true);
  });
});

describe('articlesToCsv', () => {
  it('writes a header and escapes values', () => {
    const csv = articlesToCsv([{ ...articles[0], title: 'Quote "inside", comma' }]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('id,title,site,category,author,status,priority,publishedAt,updatedAt,views');
    expect(row).toContain('"Quote ""inside"", comma"');
  });
});
