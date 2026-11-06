import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { UserAvatar } from '../../../components/UserAvatar';
import { getSite } from '../../../data/sites';
import { findPhoto, findVideo, getAuthorName } from '../../../store/selectors';
import { useNewsroom } from '../../../store/useNewsroom';
import { HEADLINE_FONT } from '../../../theme/theme';
import type { Article, ContentBlock } from '../../../types';
import { formatDateTime } from '../../../utils/format';
import { blocksToPlainText, countWords, readingTime } from '../../../utils/text';

/** Renders the article roughly as readers will see it on the website. */
export function ArticlePreview({ article }: { article: Article }) {
  const { state } = useNewsroom();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const site = getSite(article.siteId);
  const featured = findPhoto(state.photos, article.featuredImageId);
  const minutes = readingTime(countWords(blocksToPlainText(article.body)));
  const date = article.publishedAt ?? article.scheduledAt ?? article.updatedAt;

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
        return block.text ? <Typography sx={{ fontSize: 17, lineHeight: 1.8, mb: 2.5 }}>{block.text}</Typography> : null;
      case 'heading':
        return block.text ? (
          <Typography variant="h5" component="h2" sx={{ fontFamily: HEADLINE_FONT, mt: 4, mb: 1.5 }}>
            {block.text}
          </Typography>
        ) : null;
      case 'quote':
        return block.text ? (
          <Box component="blockquote" sx={{ borderLeft: 4, borderColor: site.color, pl: 3, py: 0.5, my: 3, mx: 0 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: 21, fontStyle: 'italic', lineHeight: 1.5 }}>“{block.text}”</Typography>
            {block.caption && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                — {block.caption}
              </Typography>
            )}
          </Box>
        ) : null;
      case 'list':
        return (
          <Box component="ul" sx={{ pl: 3, mb: 2.5, '& li': { fontSize: 17, lineHeight: 1.8 } }}>
            {(block.items ?? []).filter(Boolean).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </Box>
        );
      case 'image': {
        const photo = findPhoto(state.photos, block.mediaId);
        return photo ? (
          <Box component="figure" sx={{ m: 0, my: 3 }}>
            <Box component="img" src={photo.url} alt={block.caption || photo.title} sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
            <Typography component="figcaption" variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
              {block.caption || photo.caption} · Photo: {photo.credit}
            </Typography>
          </Box>
        ) : null;
      }
      case 'video': {
        const video = findVideo(state.videos, block.mediaId);
        return video ? (
          <Box component="figure" sx={{ m: 0, my: 3 }}>
            <Box component="video" src={video.src} poster={video.thumbnailUrl} controls sx={{ width: '100%', borderRadius: 1, display: 'block', bgcolor: 'common.black' }} />
            <Typography component="figcaption" variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
              {block.caption || video.title}
            </Typography>
          </Box>
        ) : null;
      }
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup size="small" exclusive value={device} onChange={(_, value) => value && setDevice(value)} aria-label="Preview device">
          <ToggleButton value="desktop" aria-label="Desktop preview">
            <DesktopWindowsRoundedIcon fontSize="small" sx={{ mr: 0.75 }} /> Desktop
          </ToggleButton>
          <ToggleButton value="mobile" aria-label="Mobile preview">
            <PhoneIphoneRoundedIcon fontSize="small" sx={{ mr: 0.75 }} /> Mobile
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box
        sx={{
          mx: 'auto',
          maxWidth: device === 'mobile' ? 390 : 760,
          border: 1,
          borderColor: 'divider',
          borderRadius: device === 'mobile' ? 5 : 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          transition: 'max-width .25s',
        }}
      >
        <Box sx={{ bgcolor: site.color, color: '#fff', px: 3, py: 1.25 }}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 900, fontSize: 18 }}>{site.name}</Typography>
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: device === 'mobile' ? 2.5 : 5 } }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
            <Typography variant="overline" sx={{ color: site.color }}>
              {article.category}
            </Typography>
            {article.priority === 'breaking' && <Chip label="BREAKING" color="error" size="small" />}
            {article.isPremium && <Chip icon={<LockRoundedIcon />} label="Premium" size="small" color="warning" variant="outlined" />}
          </Stack>
          <Typography
            component="h1"
            sx={{ fontFamily: HEADLINE_FONT, fontWeight: 900, fontSize: device === 'mobile' ? 26 : 36, lineHeight: 1.2, mb: 2 }}
          >
            {article.title || 'Your headline goes here'}
          </Typography>
          <Typography sx={{ fontSize: device === 'mobile' ? 17 : 20, color: 'text.secondary', lineHeight: 1.6, mb: 2.5 }}>
            {article.lead || 'The lead summarises the story in one or two sentences.'}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
            <UserAvatar name={getAuthorName(article.authorId)} size={36} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {getAuthorName(article.authorId)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDateTime(date)} · {minutes} min read
              </Typography>
            </div>
          </Stack>
          {featured && (
            <Box component="figure" sx={{ m: 0, mb: 3 }}>
              <Box component="img" src={featured.url} alt={featured.title} sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
              <Typography component="figcaption" variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
                {featured.caption} · Photo: {featured.credit}
              </Typography>
            </Box>
          )}
          {article.body.map((block) => (
            <Box key={block.id}>{renderBlock(block)}</Box>
          ))}
          {article.tags.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {article.tags.map((tag) => (
                  <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
