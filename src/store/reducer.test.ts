import { describe, expect, it } from 'vitest';
import { createTestState } from '../test/renderWithProviders';
import type { ActivityEvent } from '../types';
import { applyStatus, MAX_ACTIVITY, newsroomReducer } from './reducer';

const AT = '2026-11-06T12:00:00.000Z';

function event(id: string): ActivityEvent {
  return { id, type: 'article_updated', message: id, at: AT, actorId: 'u-001' };
}

describe('newsroomReducer', () => {
  it('inserts new articles at the top and replaces existing ones', () => {
    const state = createTestState();
    const existing = state.articles[3];

    const updated = newsroomReducer(state, { type: 'articles/upsert', article: { ...existing, title: 'Changed' } });
    expect(updated.articles).toHaveLength(state.articles.length);
    expect(updated.articles[3].title).toBe('Changed');

    const inserted = newsroomReducer(state, { type: 'articles/upsert', article: { ...existing, id: 'art-new' } });
    expect(inserted.articles[0].id).toBe('art-new');
    expect(inserted.articles).toHaveLength(state.articles.length + 1);
  });

  it('changes the status of many articles at once', () => {
    const state = createTestState();
    const ids = state.articles.slice(0, 3).map((a) => a.id);
    const next = newsroomReducer(state, { type: 'articles/setStatus', ids, status: 'archived', at: AT });
    expect(next.articles.slice(0, 3).every((a) => a.status === 'archived' && a.updatedAt === AT)).toBe(true);
    expect(next.articles[3]).toBe(state.articles[3]);
  });

  it('removes deleted photos from featured images', () => {
    const state = createTestState();
    const article = state.articles.find((a) => a.featuredImageId)!;
    const next = newsroomReducer(state, { type: 'photos/remove', ids: [article.featuredImageId!] });
    expect(next.photos.some((p) => p.id === article.featuredImageId)).toBe(false);
    expect(next.articles.find((a) => a.id === article.id)!.featuredImageId).toBeUndefined();
  });

  it('prepends activity events and caps the log', () => {
    let state = createTestState();
    for (let i = 0; i < MAX_ACTIVITY + 5; i += 1) {
      state = newsroomReducer(state, { type: 'profile/update', changes: { location: `City ${i}` }, activity: event(`e${i}`) });
    }
    expect(state.activity).toHaveLength(MAX_ACTIVITY);
    expect(state.activity[0].id).toBe(`e${MAX_ACTIVITY + 4}`);
    expect(state.profile.location).toBe(`City ${MAX_ACTIVITY + 4}`);
  });
});

describe('applyStatus', () => {
  it('sets publishedAt when publishing and clears the schedule', () => {
    const article = { ...createTestState().articles[0], status: 'scheduled' as const, scheduledAt: AT, publishedAt: undefined };
    const published = applyStatus(article, 'published', AT);
    expect(published.publishedAt).toBe(AT);
    expect(published.scheduledAt).toBeUndefined();
  });

  it('keeps the original publication date when re-saving a published article', () => {
    const article = { ...createTestState().articles[0], status: 'published' as const, publishedAt: '2026-01-01T00:00:00.000Z' };
    expect(applyStatus(article, 'published', AT).publishedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('clears the schedule when moving back to draft', () => {
    const article = { ...createTestState().articles[0], status: 'scheduled' as const, scheduledAt: AT };
    expect(applyStatus(article, 'draft', AT).scheduledAt).toBeUndefined();
  });
});
