import { getSite } from '../data/sites';
import type { Article, ArticlePriority, ContentBlock, ContentBlockType, SiteId } from '../types';
import { createId } from './id';

interface NewArticleOptions {
  siteId: SiteId;
  authorId: string;
  priority?: ArticlePriority;
  now?: string;
}

/** Creates an unsaved draft with sensible defaults. */
export function createEmptyArticle({ siteId, authorId, priority = 'normal', now = new Date().toISOString() }: NewArticleOptions): Article {
  return {
    id: createId('art'),
    title: '',
    slug: '',
    lead: '',
    body: [createBlock('paragraph')],
    siteId,
    category: getSite(siteId).categories[0],
    tags: priority === 'breaking' ? ['breaking'] : [],
    authorId,
    status: 'draft',
    priority,
    createdAt: now,
    updatedAt: now,
    views: 0,
    comments: 0,
    isPremium: false,
    allowComments: true,
    editorNotes: '',
    seo: { metaTitle: '', metaDescription: '', noIndex: false },
    revisions: [],
  };
}

export function createBlock(type: ContentBlockType): ContentBlock {
  const block: ContentBlock = { id: createId('blk'), type };
  if (type === 'list') block.items = [''];
  else if (type !== 'image' && type !== 'video') block.text = '';
  return block;
}

/** Copy of an article saved as a new draft. */
export function duplicateArticle(source: Article, authorId: string, now = new Date().toISOString()): Article {
  const id = createId('art');
  return {
    ...source,
    id,
    title: `${source.title} (copy)`,
    slug: `${source.slug}-copy`,
    body: source.body.map((block) => ({ ...block, id: createId('blk') })),
    status: 'draft',
    authorId,
    createdAt: now,
    updatedAt: now,
    publishedAt: undefined,
    scheduledAt: undefined,
    views: 0,
    comments: 0,
    revisions: [],
  };
}
