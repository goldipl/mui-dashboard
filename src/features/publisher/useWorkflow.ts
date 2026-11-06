import { useCallback, useState } from 'react';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { Article, ArticleStatus } from '../../types';
import { canTransition, hasBlockingIssues, STATUS_META, validateForPublish } from '../../utils/workflow';

/**
 * Encapsulates moving articles through the editorial workflow from the publisher board.
 * Validates the target status and asks for a date when an article is scheduled.
 */
export function useWorkflow() {
  const { actions } = useNewsroom();
  const notify = useNotify();
  const [scheduling, setScheduling] = useState<Article | null>(null);

  const moveTo = useCallback(
    (article: Article, target: ArticleStatus): boolean => {
      if (article.status === target) return false;
      if (!canTransition(article.status, target)) {
        notify(`“${STATUS_META[article.status].label}” articles cannot be moved to “${STATUS_META[target].label}”.`, 'warning');
        return false;
      }
      if (target === 'scheduled') {
        setScheduling(article);
        return false;
      }
      if (target === 'published' || target === 'in_review') {
        const errors = validateForPublish(article, target).filter((issue) => issue.severity === 'error');
        if (hasBlockingIssues(errors)) {
          notify(`Cannot move “${article.title || 'Untitled'}”: ${errors[0].message}`, 'error');
          return false;
        }
      }
      actions.setArticleStatus([article.id], target);
      notify(`Moved to “${STATUS_META[target].label}”.`);
      return true;
    },
    [actions, notify],
  );

  const confirmSchedule = useCallback(
    (iso: string) => {
      if (!scheduling) return;
      const candidate: Article = { ...scheduling, scheduledAt: iso };
      const errors = validateForPublish(candidate, 'scheduled').filter((issue) => issue.severity === 'error');
      if (errors.length > 0) {
        notify(`Cannot schedule: ${errors[0].message}`, 'error');
        setScheduling(null);
        return;
      }
      actions.saveArticle(
        { ...candidate, status: 'scheduled' },
        { activityMessage: `Scheduled “${candidate.title}”` },
      );
      notify('Article scheduled.');
      setScheduling(null);
    },
    [actions, notify, scheduling],
  );

  return { moveTo, scheduling, confirmSchedule, cancelSchedule: () => setScheduling(null) };
}
