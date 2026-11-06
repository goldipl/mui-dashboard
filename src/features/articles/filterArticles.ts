import { getAuthorName } from '../../store/selectors';
import type { Article, ArticlePriority, ArticleStatus, SiteId } from '../../types';

export interface ArticleFilters {
  query: string;
  status: ArticleStatus | 'all';
  siteId: SiteId | 'all';
  authorId: string | 'all';
  priority: ArticlePriority | 'all';
}

export const DEFAULT_FILTERS: ArticleFilters = {
  query: '',
  status: 'all',
  siteId: 'all',
  authorId: 'all',
  priority: 'all',
};

/** Filters articles by free text (headline, lead, tags, category, author) and exact-match facets. */
export function filterArticles(articles: Article[], filters: ArticleFilters, ignore: (keyof ArticleFilters)[] = []): Article[] {
  const query = filters.query.trim().toLowerCase();
  const active = (key: keyof ArticleFilters) => !ignore.includes(key);

  return articles.filter((article) => {
    if (active('status') && filters.status !== 'all' && article.status !== filters.status) return false;
    if (active('siteId') && filters.siteId !== 'all' && article.siteId !== filters.siteId) return false;
    if (active('authorId') && filters.authorId !== 'all' && article.authorId !== filters.authorId) return false;
    if (active('priority') && filters.priority !== 'all' && article.priority !== filters.priority) return false;
    if (active('query') && query) {
      const haystack = [article.title, article.lead, article.category, getAuthorName(article.authorId), ...article.tags]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function escapeCsv(value: string | number | undefined): string {
  const text = value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Serialises articles to CSV for export. */
export function articlesToCsv(articles: Article[]): string {
  const header = ['id', 'title', 'site', 'category', 'author', 'status', 'priority', 'publishedAt', 'updatedAt', 'views'];
  const rows = articles.map((a) =>
    [a.id, a.title, a.siteId, a.category, getAuthorName(a.authorId), a.status, a.priority, a.publishedAt, a.updatedAt, a.views]
      .map(escapeCsv)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}
