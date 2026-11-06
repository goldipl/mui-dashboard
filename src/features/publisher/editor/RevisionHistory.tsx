import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { EmptyState } from '../../../components/EmptyState';
import { UserAvatar } from '../../../components/UserAvatar';
import { getAuthorName } from '../../../store/selectors';
import type { Article, ArticleRevision } from '../../../types';
import { formatDateTime, formatRelative } from '../../../utils/format';
import { blocksToPlainText, countWords } from '../../../utils/text';

interface RevisionHistoryProps {
  article: Article;
  onRestore: (revision: ArticleRevision) => void;
}

/** Saved snapshots of the article with the option to restore one into the editor. */
export function RevisionHistory({ article, onRestore }: RevisionHistoryProps) {
  const [toRestore, setToRestore] = useState<ArticleRevision | null>(null);

  if (article.revisions.length === 0) {
    return <EmptyState icon={<HistoryRoundedIcon />} title="No revisions yet" description="A revision is stored every time you save the article." />;
  }

  return (
    <>
      <Stack spacing={1.5}>
        {article.revisions.map((revision, index) => {
          const author = getAuthorName(revision.authorId);
          const words = countWords(blocksToPlainText(revision.snapshot.body));
          return (
            <Stack
              key={revision.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, alignItems: { sm: 'center' } }}
            >
              <UserAvatar name={author} size={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600 }}>{revision.note}</Typography>
                  {index === 0 && <Chip label="Latest" size="small" color="primary" />}
                </Stack>
                <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                  “{revision.snapshot.title || 'Untitled'}” · {words} words
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} title={formatDateTime(revision.createdAt)}>
                  {author} · {formatRelative(revision.createdAt)}
                </Typography>
              </Box>
              <Button size="small" startIcon={<RestoreRoundedIcon />} onClick={() => setToRestore(revision)}>
                Restore
              </Button>
            </Stack>
          );
        })}
      </Stack>
      <ConfirmDialog
        open={Boolean(toRestore)}
        title="Restore this revision?"
        description="The headline, lead and body in the editor will be replaced. Changes are not saved until you click Save."
        confirmLabel="Restore"
        onClose={() => setToRestore(null)}
        onConfirm={() => toRestore && onRestore(toRestore)}
      />
    </>
  );
}
