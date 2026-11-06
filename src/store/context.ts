import { createContext } from 'react';
import type { Article, ArticleStatus, EditorProfile, Photo, Video } from '../types';
import type { NewsroomState } from './reducer';

export interface SaveArticleOptions {
  /** When provided, a revision snapshot with this note is stored. */
  revisionNote?: string;
  /** Overrides the default "Updated …" message in the activity log. */
  activityMessage?: string;
}

export interface NewsroomActions {
  saveArticle: (article: Article, options?: SaveArticleOptions) => Article;
  deleteArticles: (ids: string[]) => void;
  setArticleStatus: (ids: string[], status: ArticleStatus) => void;
  duplicateArticle: (id: string) => Article | undefined;
  addPhotos: (photos: Photo[]) => void;
  updatePhoto: (id: string, changes: Partial<Omit<Photo, 'id'>>) => void;
  deletePhotos: (ids: string[]) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, changes: Partial<Omit<Video, 'id'>>) => void;
  deleteVideos: (ids: string[]) => void;
  updateProfile: (changes: Partial<Omit<EditorProfile, 'id'>>) => void;
  resetDemoData: () => void;
}

export interface NewsroomContextValue {
  state: NewsroomState;
  actions: NewsroomActions;
}

export const NewsroomContext = createContext<NewsroomContextValue | null>(null);
