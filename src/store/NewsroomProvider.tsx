import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { createSeedData } from '../data/seed';
import { useNotify } from '../hooks/useNotify';
import { CURRENT_USER_ID } from '../data/sites';
import type { ActivityEvent, ActivityType, Article } from '../types';
import { duplicateArticle as cloneArticle } from '../utils/articleFactory';
import { createId } from '../utils/id';
import { slugify } from '../utils/text';
import { STATUS_META } from '../utils/workflow';
import { NewsroomContext, type NewsroomActions } from './context';
import { newsroomReducer, STATE_VERSION, type NewsroomState } from './reducer';
import { clearState, loadState, saveState } from './storage';

const PERSIST_DELAY_MS = 400;
const SCHEDULER_INTERVAL_MS = 20_000;
const TRANSCODER_INTERVAL_MS = 1_500;

function createInitialState(): NewsroomState {
  return loadState() ?? { version: STATE_VERSION, ...createSeedData() };
}

function activity(type: ActivityType, message: string, articleId?: string): ActivityEvent {
  return { id: createId('act'), type, message, at: new Date().toISOString(), actorId: CURRENT_USER_ID, articleId };
}

interface NewsroomProviderProps {
  children: ReactNode;
  /** Optional initial state – used by tests. */
  initialState?: NewsroomState;
  /** Disables localStorage persistence – used by tests. */
  disablePersistence?: boolean;
}

/**
 * Holds the whole newsroom state (articles, media, profile, activity) and exposes action creators.
 * Also runs two background jobs: the publishing scheduler and the simulated video transcoder.
 */
export function NewsroomProvider({ children, initialState, disablePersistence = false }: NewsroomProviderProps) {
  const [state, dispatch] = useReducer(newsroomReducer, initialState, (init) => init ?? createInitialState());
  const stateRef = useRef(state);
  const storageWarningShown = useRef(false);
  const notify = useNotify();

  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist to localStorage (debounced). Warn once when the storage quota is exceeded.
  useEffect(() => {
    if (disablePersistence) return undefined;
    const timer = window.setTimeout(() => {
      if (saveState(state) || storageWarningShown.current) return;
      storageWarningShown.current = true;
      notify('Browser storage is full – new changes will not survive a reload. Delete some uploaded photos.', 'warning');
    }, PERSIST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, disablePersistence, notify]);

  // Scheduler: publish scheduled articles whose time has come.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const due = stateRef.current.articles.filter(
        (article) => article.status === 'scheduled' && article.scheduledAt && new Date(article.scheduledAt).getTime() <= now,
      );
      if (due.length === 0) return;
      dispatch({
        type: 'articles/setStatus',
        ids: due.map((article) => article.id),
        status: 'published',
        at: new Date(now).toISOString(),
        activity: activity('article_status', `Scheduler published ${due.length} article${due.length > 1 ? 's' : ''}`),
      });
    };
    tick();
    const timer = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  // Simulated transcoding of uploaded videos.
  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const video of stateRef.current.videos) {
        if (video.status !== 'processing') continue;
        const progress = Math.min(100, video.progress + 4 + Math.round(Math.random() * 8));
        dispatch({
          type: 'videos/update',
          id: video.id,
          changes: progress >= 100 ? { progress: 100, status: 'ready' } : { progress },
        });
      }
    }, TRANSCODER_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const actions = useMemo<NewsroomActions>(
    () => ({
      saveArticle(article, options = {}) {
        const now = new Date().toISOString();
        const isNew = !stateRef.current.articles.some((item) => item.id === article.id);
        const saved: Article = {
          ...article,
          slug: article.slug || slugify(article.title),
          updatedAt: now,
          revisions: options.revisionNote
            ? [
                {
                  id: createId('rev'),
                  createdAt: now,
                  authorId: CURRENT_USER_ID,
                  note: options.revisionNote,
                  snapshot: { title: article.title, lead: article.lead, body: article.body },
                },
                ...article.revisions,
              ]
            : article.revisions,
        };
        dispatch({
          type: 'articles/upsert',
          article: saved,
          activity: activity(
            options.activityMessage ? 'article_status' : isNew ? 'article_created' : 'article_updated',
            options.activityMessage ?? `${isNew ? 'Created' : 'Updated'} “${saved.title || 'Untitled article'}”`,
            saved.id,
          ),
        });
        return saved;
      },
      deleteArticles(ids) {
        const titles = stateRef.current.articles.filter((a) => ids.includes(a.id)).map((a) => a.title);
        dispatch({
          type: 'articles/remove',
          ids,
          activity: activity(
            'article_deleted',
            ids.length === 1 ? `Deleted “${titles[0] ?? 'article'}”` : `Deleted ${ids.length} articles`,
          ),
        });
      },
      setArticleStatus(ids, status) {
        const label = STATUS_META[status].label.toLowerCase();
        const first = stateRef.current.articles.find((a) => a.id === ids[0]);
        dispatch({
          type: 'articles/setStatus',
          ids,
          status,
          at: new Date().toISOString(),
          activity: activity(
            'article_status',
            ids.length === 1 ? `Moved “${first?.title ?? 'article'}” to ${label}` : `Moved ${ids.length} articles to ${label}`,
            ids.length === 1 ? ids[0] : undefined,
          ),
        });
      },
      duplicateArticle(id) {
        const source = stateRef.current.articles.find((article) => article.id === id);
        if (!source) return undefined;
        const copy = cloneArticle(source, CURRENT_USER_ID);
        dispatch({
          type: 'articles/upsert',
          article: copy,
          activity: activity('article_created', `Duplicated “${source.title}”`, copy.id),
        });
        return copy;
      },
      addPhotos(photos) {
        dispatch({
          type: 'photos/add',
          photos,
          activity: activity(
            'photo_uploaded',
            photos.length === 1 ? `Uploaded photo “${photos[0].title}”` : `Uploaded ${photos.length} photos`,
          ),
        });
      },
      updatePhoto(id, changes) {
        dispatch({ type: 'photos/update', id, changes });
      },
      deletePhotos(ids) {
        dispatch({
          type: 'photos/remove',
          ids,
          activity: activity('photo_deleted', `Deleted ${ids.length} photo${ids.length > 1 ? 's' : ''}`),
        });
      },
      addVideo(video) {
        dispatch({ type: 'videos/add', video, activity: activity('video_uploaded', `Uploaded video “${video.title}”`) });
      },
      updateVideo(id, changes) {
        dispatch({ type: 'videos/update', id, changes });
      },
      deleteVideos(ids) {
        dispatch({
          type: 'videos/remove',
          ids,
          activity: activity('video_deleted', `Deleted ${ids.length} video${ids.length > 1 ? 's' : ''}`),
        });
      },
      updateProfile(changes) {
        dispatch({ type: 'profile/update', changes, activity: activity('profile_updated', 'Updated editor profile') });
      },
      resetDemoData() {
        clearState();
        dispatch({ type: 'state/replace', state: { version: STATE_VERSION, ...createSeedData() } });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <NewsroomContext.Provider value={value}>{children}</NewsroomContext.Provider>;
}
