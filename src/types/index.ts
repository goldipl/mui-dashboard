/**
 * Domain model of the newsroom dashboard.
 * All dates are stored as ISO-8601 strings so the state can be serialised to localStorage.
 */

export type SiteId = 'herald' | 'sport' | 'tech' | 'business' | 'lifestyle';

export interface Site {
  id: SiteId;
  name: string;
  domain: string;
  description: string;
  color: string;
  categories: string[];
}

export type ArticleStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

export type ArticlePriority = 'low' | 'normal' | 'high' | 'breaking';

export type UserRole = 'Editor-in-Chief' | 'Senior Editor' | 'Editor' | 'Reporter' | 'Photo Editor' | 'Video Producer';

export interface Author {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  siteIds: SiteId[];
}

export type ContentBlockType = 'paragraph' | 'heading' | 'quote' | 'list' | 'image' | 'video';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  /** Text for paragraph, heading and quote blocks. */
  text?: string;
  /** Quote attribution or media caption. */
  caption?: string;
  /** Items of a bullet list block. */
  items?: string[];
  /** Referenced photo or video id for media blocks. */
  mediaId?: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  noIndex: boolean;
}

export interface ArticleRevision {
  id: string;
  createdAt: string;
  authorId: string;
  note: string;
  snapshot: Pick<Article, 'title' | 'lead' | 'body'>;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  lead: string;
  body: ContentBlock[];
  siteId: SiteId;
  category: string;
  tags: string[];
  authorId: string;
  status: ArticleStatus;
  priority: ArticlePriority;
  featuredImageId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  views: number;
  comments: number;
  isPremium: boolean;
  allowComments: boolean;
  editorNotes: string;
  seo: SeoSettings;
  revisions: ArticleRevision[];
}

export type PhotoLicense = 'editorial' | 'royalty_free' | 'rights_managed' | 'creative_commons';

export interface Photo {
  id: string;
  title: string;
  caption: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  credit: string;
  license: PhotoLicense;
  tags: string[];
  format: 'jpg' | 'png' | 'webp';
  sizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
}

export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  src: string;
  durationSec: number;
  status: VideoStatus;
  /** Transcoding progress in percent, relevant while `status === 'processing'`. */
  progress: number;
  resolution: '720p' | '1080p' | '4K';
  sizeMb: number;
  siteId: SiteId;
  tags: string[];
  views: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface NotificationPreferences {
  emailOnReview: boolean;
  emailOnPublish: boolean;
  pushBreakingNews: boolean;
  weeklyDigest: boolean;
}

export interface EditorProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  location: string;
  bio: string;
  joinedAt: string;
  languages: string[];
  beats: string[];
  siteIds: SiteId[];
  social: {
    x?: string;
    linkedin?: string;
  };
  defaultSiteId: SiteId;
  notifications: NotificationPreferences;
}

export type ActivityType =
  | 'article_created'
  | 'article_updated'
  | 'article_status'
  | 'article_deleted'
  | 'photo_uploaded'
  | 'photo_deleted'
  | 'video_uploaded'
  | 'video_deleted'
  | 'profile_updated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  at: string;
  actorId: string;
  articleId?: string;
}
