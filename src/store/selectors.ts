import { AUTHORS } from '../data/sites';
import type { Article, ArticleStatus, Author, Photo, SiteId, Video } from '../types';

const DAY = 86_400_000;
const AUTHOR_MAP = new Map(AUTHORS.map((author) => [author.id, author]));

export function getAuthor(id: string): Author | undefined {
  return AUTHOR_MAP.get(id);
}

export function getAuthorName(id: string): string {
  return AUTHOR_MAP.get(id)?.name ?? 'Unknown author';
}

export function countByStatus(articles: Article[]): Record<ArticleStatus, number> {
  const counts: Record<ArticleStatus, number> = { draft: 0, in_review: 0, scheduled: 0, published: 0, archived: 0 };
  for (const article of articles) counts[article.status] += 1;
  return counts;
}

export function countBySite(articles: Article[]): Record<SiteId, number> {
  const counts: Record<SiteId, number> = { herald: 0, sport: 0, tech: 0, business: 0, lifestyle: 0 };
  for (const article of articles) counts[article.siteId] += 1;
  return counts;
}

export function findPhoto(photos: Photo[], id: string | undefined): Photo | undefined {
  return id ? photos.find((photo) => photo.id === id) : undefined;
}

export function findVideo(videos: Video[], id: string | undefined): Video | undefined {
  return id ? videos.find((video) => video.id === id) : undefined;
}

/** Articles that use a media item as featured image or inside the body. */
export function articlesUsingMedia(articles: Article[], mediaId: string): Article[] {
  return articles.filter(
    (article) => article.featuredImageId === mediaId || article.body.some((block) => block.mediaId === mediaId),
  );
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Number of articles published on each of the last `days` days, oldest first. */
export function publishedPerDay(articles: Article[], days: number, now: number, siteId?: SiteId): number[] {
  const start = startOfDay(now) - (days - 1) * DAY;
  const buckets = new Array<number>(days).fill(0);
  for (const article of articles) {
    if (!article.publishedAt || (siteId && article.siteId !== siteId)) continue;
    const index = Math.floor((new Date(article.publishedAt).getTime() - start) / DAY);
    if (index >= 0 && index < days) buckets[index] += 1;
  }
  return buckets;
}

/** Labels (e.g. `Nov 6`) for the last `days` days, oldest first. */
export function dayLabels(days: number, now: number): string[] {
  const start = startOfDay(now) - (days - 1) * DAY;
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
  return Array.from({ length: days }, (_, index) => formatter.format(new Date(start + index * DAY)));
}
