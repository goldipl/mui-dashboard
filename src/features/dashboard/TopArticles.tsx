import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { SiteChip } from '../../components/Chips';
import { SITES } from '../../data/sites';
import { findPhoto, getAuthorName } from '../../store/selectors';
import type { Article, Photo, SiteId } from '../../types';
import { formatCompact, formatRelative } from '../../utils/format';

/** Ranking of the most read published articles, optionally filtered by site. */
export function TopArticles({ articles, photos }: { articles: Article[]; photos: Photo[] }) {
  const [siteId, setSiteId] = useState<SiteId | 'all'>('all');

  const top = useMemo(
    () =>
      articles
        .filter((a) => a.status === 'published' && (siteId === 'all' || a.siteId === siteId))
        .sort((a, b) => b.views - a.views)
        .slice(0, 6),
    [articles, siteId],
  );
  const max = top[0]?.views ?? 1;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Top performing articles"
        subheader="Most read published stories"
        action={
          <TextField select value={siteId} onChange={(e) => setSiteId(e.target.value as SiteId | 'all')} sx={{ minWidth: 160 }} aria-label="Filter by site">
            <MenuItem value="all">All sites</MenuItem>
            {SITES.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <Stack spacing={2} sx={{ px: 2, pb: 2.5 }}>
        {top.map((article, index) => {
          const photo = findPhoto(photos, article.featuredImageId);
          return (
            <Stack key={article.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography sx={{ width: 22, fontWeight: 800, color: 'text.secondary', textAlign: 'center' }}>{index + 1}</Typography>
              <Box
                sx={{ width: 72, height: 48, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, bgcolor: 'action.hover', display: { xs: 'none', sm: 'block' } }}
              >
                {photo && <Box component="img" src={photo.thumbnailUrl} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Link
                  component={RouterLink}
                  to={`/publisher/articles/${article.id}`}
                  underline="hover"
                  color="inherit"
                  sx={{ fontWeight: 600, fontSize: 14, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {article.title}
                </Link>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <SiteChip siteId={article.siteId} short sx={{ height: 20, fontSize: 11 }} />
                  <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                    {getAuthorName(article.authorId)} · {formatRelative(article.publishedAt)}
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(article.views / max) * 100} sx={{ mt: 0.75, height: 5, borderRadius: 3 }} />
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: 64 }}>
                <Typography sx={{ fontWeight: 700 }}>{formatCompact(article.views)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {article.comments} comments
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}
