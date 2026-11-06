import type { SeedData } from '../data/seed';
import type { ActivityEvent, Article, ArticleStatus, EditorProfile, Photo, Video } from '../types';

export const STATE_VERSION = 1;
export const MAX_ACTIVITY = 100;

export interface NewsroomState extends SeedData {
  version: number;
}

type WithActivity = { activity?: ActivityEvent };

export type NewsroomAction = WithActivity &
  (
    | { type: 'articles/upsert'; article: Article }
    | { type: 'articles/remove'; ids: string[] }
    | { type: 'articles/setStatus'; ids: string[]; status: ArticleStatus; at: string }
    | { type: 'photos/add'; photos: Photo[] }
    | { type: 'photos/update'; id: string; changes: Partial<Omit<Photo, 'id'>> }
    | { type: 'photos/remove'; ids: string[] }
    | { type: 'videos/add'; video: Video }
    | { type: 'videos/update'; id: string; changes: Partial<Omit<Video, 'id'>> }
    | { type: 'videos/remove'; ids: string[] }
    | { type: 'profile/update'; changes: Partial<Omit<EditorProfile, 'id'>> }
    | { type: 'state/replace'; state: NewsroomState }
  );

/** Applies a workflow status to a single article, keeping publication dates consistent. */
export function applyStatus(article: Article, status: ArticleStatus, at: string): Article {
  const next: Article = { ...article, status, updatedAt: at };
  switch (status) {
    case 'published':
      next.publishedAt = article.status === 'published' && article.publishedAt ? article.publishedAt : at;
      next.scheduledAt = undefined;
      break;
    case 'draft':
    case 'in_review':
      next.scheduledAt = undefined;
      break;
    case 'scheduled':
    case 'archived':
      break;
  }
  return next;
}

function reduce(state: NewsroomState, action: NewsroomAction): NewsroomState {
  switch (action.type) {
    case 'articles/upsert': {
      const exists = state.articles.some((article) => article.id === action.article.id);
      const articles = exists
        ? state.articles.map((article) => (article.id === action.article.id ? action.article : article))
        : [action.article, ...state.articles];
      return { ...state, articles };
    }
    case 'articles/remove': {
      const ids = new Set(action.ids);
      return { ...state, articles: state.articles.filter((article) => !ids.has(article.id)) };
    }
    case 'articles/setStatus': {
      const ids = new Set(action.ids);
      return {
        ...state,
        articles: state.articles.map((article) =>
          ids.has(article.id) ? applyStatus(article, action.status, action.at) : article,
        ),
      };
    }
    case 'photos/add':
      return { ...state, photos: [...action.photos, ...state.photos] };
    case 'photos/update':
      return {
        ...state,
        photos: state.photos.map((photo) => (photo.id === action.id ? { ...photo, ...action.changes } : photo)),
      };
    case 'photos/remove': {
      const ids = new Set(action.ids);
      return {
        ...state,
        photos: state.photos.filter((photo) => !ids.has(photo.id)),
        // Detach removed photos from articles so no broken featured images remain.
        articles: state.articles.map((article) =>
          article.featuredImageId && ids.has(article.featuredImageId)
            ? { ...article, featuredImageId: undefined }
            : article,
        ),
      };
    }
    case 'videos/add':
      return { ...state, videos: [action.video, ...state.videos] };
    case 'videos/update':
      return {
        ...state,
        videos: state.videos.map((video) => (video.id === action.id ? { ...video, ...action.changes } : video)),
      };
    case 'videos/remove': {
      const ids = new Set(action.ids);
      return { ...state, videos: state.videos.filter((video) => !ids.has(video.id)) };
    }
    case 'profile/update':
      return { ...state, profile: { ...state.profile, ...action.changes } };
    case 'state/replace':
      return action.state;
  }
}

/** Pure reducer. Side-effect data (ids, timestamps) is created by action creators in the provider. */
export function newsroomReducer(state: NewsroomState, action: NewsroomAction): NewsroomState {
  const next = reduce(state, action);
  if (!action.activity || action.type === 'state/replace') return next;
  return { ...next, activity: [action.activity, ...next.activity].slice(0, MAX_ACTIVITY) };
}
