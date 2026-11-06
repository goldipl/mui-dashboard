import { describe, expect, it } from 'vitest';
import type { Article } from '../types';
import { createEmptyArticle } from './articleFactory';
import { canTransition, hasBlockingIssues, nextStatus, previousStatus, validateForPublish } from './workflow';

function readyArticle(overrides: Partial<Article> = {}): Article {
  const base = createEmptyArticle({ siteId: 'herald', authorId: 'u-001', now: '2026-11-06T10:00:00Z' });
  return {
    ...base,
    title: 'Parliament approves new housing reform',
    lead: 'The vote ends months of debate and will change how social housing is financed.',
    body: [{ id: 'b1', type: 'paragraph', text: 'word '.repeat(60).trim() }],
    featuredImageId: 'ph-001',
    seo: { metaTitle: '', metaDescription: 'Short description', noIndex: false },
    ...overrides,
  };
}

describe('workflow transitions', () => {
  it('allows the standard editorial path', () => {
    expect(canTransition('draft', 'in_review')).toBe(true);
    expect(canTransition('in_review', 'scheduled')).toBe(true);
    expect(canTransition('scheduled', 'published')).toBe(true);
    expect(canTransition('published', 'archived')).toBe(true);
  });

  it('blocks invalid jumps', () => {
    expect(canTransition('archived', 'published')).toBe(false);
    expect(canTransition('published', 'in_review')).toBe(false);
    expect(canTransition('scheduled', 'archived')).toBe(false);
  });

  it('knows the next and previous board column', () => {
    expect(nextStatus('draft')).toBe('in_review');
    expect(nextStatus('published')).toBeUndefined();
    expect(previousStatus('in_review')).toBe('draft');
    expect(previousStatus('draft')).toBeUndefined();
  });
});

describe('validateForPublish', () => {
  it('accepts a complete article', () => {
    expect(validateForPublish(readyArticle())).toEqual([]);
  });

  it('reports blocking errors for missing content', () => {
    const issues = validateForPublish(readyArticle({ title: 'Short', lead: '', body: [] }));
    expect(hasBlockingIssues(issues)).toBe(true);
    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['title', 'lead', 'body']));
  });

  it('only warns about a missing featured image', () => {
    const issues = validateForPublish(readyArticle({ featuredImageId: undefined }));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ field: 'featuredImage', severity: 'warning' });
    expect(hasBlockingIssues(issues)).toBe(false);
  });

  it('requires a future date when scheduling', () => {
    const past = validateForPublish(readyArticle({ scheduledAt: '2000-01-01T00:00:00Z' }), 'scheduled');
    expect(past.some((issue) => issue.field === 'schedule' && issue.severity === 'error')).toBe(true);

    const future = validateForPublish(readyArticle({ scheduledAt: '2999-01-01T00:00:00Z' }), 'scheduled');
    expect(future.some((issue) => issue.field === 'schedule')).toBe(false);
  });
});
