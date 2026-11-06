import type { Article, ArticlePriority, ArticleStatus } from '../types';
import { blocksToPlainText, countWords } from './text';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const STATUS_META: Record<ArticleStatus, { label: string; color: ChipColor; description: string }> = {
  draft: { label: 'Draft', color: 'default', description: 'Work in progress, visible only to the newsroom.' },
  in_review: { label: 'In review', color: 'warning', description: 'Waiting for an editor to approve.' },
  scheduled: { label: 'Scheduled', color: 'info', description: 'Approved and queued for automatic publishing.' },
  published: { label: 'Published', color: 'success', description: 'Live on the website.' },
  archived: { label: 'Archived', color: 'secondary', description: 'Removed from the website, kept for reference.' },
};

export const STATUS_ORDER: ArticleStatus[] = ['draft', 'in_review', 'scheduled', 'published', 'archived'];

export const PRIORITY_META: Record<ArticlePriority, { label: string; color: ChipColor }> = {
  low: { label: 'Low', color: 'default' },
  normal: { label: 'Normal', color: 'primary' },
  high: { label: 'High', color: 'warning' },
  breaking: { label: 'Breaking', color: 'error' },
};

/** Allowed workflow transitions. Editors can always send an article back to draft. */
export const TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['in_review', 'scheduled', 'published', 'archived'],
  in_review: ['draft', 'scheduled', 'published'],
  scheduled: ['draft', 'published'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

export function canTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

/** The "next" step on the publisher board. */
export function nextStatus(status: ArticleStatus): ArticleStatus | undefined {
  const map: Partial<Record<ArticleStatus, ArticleStatus>> = {
    draft: 'in_review',
    in_review: 'scheduled',
    scheduled: 'published',
  };
  return map[status];
}

export function previousStatus(status: ArticleStatus): ArticleStatus | undefined {
  const map: Partial<Record<ArticleStatus, ArticleStatus>> = {
    in_review: 'draft',
    scheduled: 'in_review',
    published: 'draft',
  };
  return map[status];
}

export interface ValidationIssue {
  field: 'title' | 'lead' | 'body' | 'featuredImage' | 'seo' | 'schedule' | 'category';
  message: string;
  severity: 'error' | 'warning';
}

export const META_DESCRIPTION_MAX = 160;
export const META_TITLE_MAX = 60;

/**
 * Checks whether an article is ready to leave the draft stage.
 * Errors block publishing, warnings are only displayed.
 */
export function validateForPublish(article: Article, target: ArticleStatus = 'published'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const words = countWords(blocksToPlainText(article.body));

  if (article.title.trim().length < 10) {
    issues.push({ field: 'title', message: 'Headline must have at least 10 characters.', severity: 'error' });
  }
  if (article.lead.trim().length < 30) {
    issues.push({ field: 'lead', message: 'Lead must have at least 30 characters.', severity: 'error' });
  }
  if (words < 50) {
    issues.push({ field: 'body', message: 'Body must contain at least 50 words.', severity: 'error' });
  }
  if (!article.category) {
    issues.push({ field: 'category', message: 'Choose a category.', severity: 'error' });
  }
  if (target === 'scheduled') {
    if (!article.scheduledAt) {
      issues.push({ field: 'schedule', message: 'Pick a publication date.', severity: 'error' });
    } else if (new Date(article.scheduledAt).getTime() <= Date.now()) {
      issues.push({ field: 'schedule', message: 'Publication date must be in the future.', severity: 'error' });
    }
  }
  if (!article.featuredImageId) {
    issues.push({ field: 'featuredImage', message: 'Articles with a featured image get more clicks.', severity: 'warning' });
  }
  if (article.seo.metaDescription.length > META_DESCRIPTION_MAX) {
    issues.push({ field: 'seo', message: `Meta description is longer than ${META_DESCRIPTION_MAX} characters.`, severity: 'warning' });
  }
  if (!article.seo.metaDescription) {
    issues.push({ field: 'seo', message: 'Meta description is empty – the lead will be used instead.', severity: 'warning' });
  }
  return issues;
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
