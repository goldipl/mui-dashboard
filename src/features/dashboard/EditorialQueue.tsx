import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router';
import { PriorityChip, SiteChip } from '../../components/Chips';
import { EmptyState } from '../../components/EmptyState';
import { UserAvatar } from '../../components/UserAvatar';
import { getAuthorName } from '../../store/selectors';
import type { Article } from '../../types';
import { formatRelative } from '../../utils/format';

/** Articles waiting for approval, breaking news first. */
export function EditorialQueue({ articles }: { articles: Article[] }) {
  const queue = useMemo(
    () =>
      articles
        .filter((a) => a.status === 'in_review')
        .sort((a, b) => Number(b.priority === 'breaking') - Number(a.priority === 'breaking') || a.updatedAt.localeCompare(b.updatedAt))
        .slice(0, 6),
    [articles],
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Review queue"
        subheader="Articles waiting for your approval"
        action={
          <Button size="small" component={RouterLink} to="/publisher">
            View all
          </Button>
        }
      />
      {queue.length === 0 ? (
        <EmptyState title="All caught up" description="There is nothing waiting for review." />
      ) : (
        <List dense sx={{ px: 1, flex: 1 }}>
          {queue.map((article) => {
            const author = getAuthorName(article.authorId);
            return (
              <ListItemButton key={article.id} component={RouterLink} to={`/publisher/articles/${article.id}`} sx={{ borderRadius: 2, alignItems: 'flex-start' }}>
                <ListItemAvatar sx={{ minWidth: 44, mt: 0.5 }}>
                  <UserAvatar name={author} size={32} />
                </ListItemAvatar>
                <ListItemText
                  primary={article.title}
                  secondary={
                    <Stack component="span" direction="row" spacing={0.75} sx={{ mt: 0.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
                      <SiteChip siteId={article.siteId} short component="span" />
                      {article.priority !== 'normal' && <PriorityChip priority={article.priority} component="span" />}
                      <span>
                        {author} · {formatRelative(article.updatedAt)}
                      </span>
                    </Stack>
                  }
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } }, secondary: { component: 'span' } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Card>
  );
}
