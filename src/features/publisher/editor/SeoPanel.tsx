import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { getSite } from '../../../data/sites';
import { findPhoto } from '../../../store/selectors';
import { useNewsroom } from '../../../store/useNewsroom';
import type { Article, SeoSettings } from '../../../types';
import { slugify, truncate } from '../../../utils/text';
import { META_DESCRIPTION_MAX, META_TITLE_MAX } from '../../../utils/workflow';

interface SeoPanelProps {
  article: Article;
  onChange: (seo: SeoSettings) => void;
}

function counterColor(length: number, max: number): string {
  if (length === 0) return 'text.secondary';
  return length > max ? 'error.main' : length > max * 0.9 ? 'warning.main' : 'success.main';
}

/** Search engine and social sharing settings with live previews. */
export function SeoPanel({ article, onChange }: SeoPanelProps) {
  const { state } = useNewsroom();
  const site = getSite(article.siteId);
  const { seo } = article;
  const title = seo.metaTitle || article.title || 'Article title';
  const description = seo.metaDescription || article.lead || 'Meta description will be generated from the lead.';
  const url = `https://${site.domain}/${slugify(article.category)}/${article.slug || slugify(article.title) || 'article-slug'}`;
  const image = findPhoto(state.photos, article.featuredImageId);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Meta title"
            value={seo.metaTitle}
            placeholder={article.title}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            fullWidth
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Leave empty to use the headline.</span>
                <Box component="span" sx={{ color: counterColor(seo.metaTitle.length, META_TITLE_MAX) }}>
                  {seo.metaTitle.length}/{META_TITLE_MAX}
                </Box>
              </Box>
            }
          />
          <TextField
            label="Meta description"
            value={seo.metaDescription}
            placeholder={article.lead}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            multiline
            minRows={3}
            fullWidth
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shown in search results. Aim for 120–160 characters.</span>
                <Box component="span" sx={{ color: counterColor(seo.metaDescription.length, META_DESCRIPTION_MAX) }}>
                  {seo.metaDescription.length}/{META_DESCRIPTION_MAX}
                </Box>
              </Box>
            }
          />
          <TextField
            label="Canonical URL"
            value={seo.canonicalUrl ?? ''}
            placeholder={url}
            onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value || undefined })}
            fullWidth
            helperText="Only set when the story was first published elsewhere."
          />
          <FormControlLabel
            control={<Switch checked={seo.noIndex} onChange={(e) => onChange({ ...seo, noIndex: e.target.checked })} />}
            label="Hide from search engines (noindex)"
          />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Search result preview
        </Typography>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
            {url}
          </Typography>
          <Typography
            component="p"
            sx={(theme) => ({ color: theme.palette.mode === 'dark' ? '#8ab4f8' : '#1a0dab', fontSize: 19, lineHeight: 1.3, my: 0.5 })}
          >
            {truncate(title, META_TITLE_MAX)} | {site.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {truncate(description, META_DESCRIPTION_MAX)}
          </Typography>
        </Box>

        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Social card preview
        </Typography>
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ aspectRatio: '1.91 / 1', bgcolor: 'action.hover' }}>
            {image && <Box component="img" src={image.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
              {site.domain}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{truncate(title, 90)}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {truncate(description, 110)}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
