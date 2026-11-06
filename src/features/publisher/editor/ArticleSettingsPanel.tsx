import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { MediaPickerDialog } from '../../../components/MediaPickerDialog';
import { AUTHORS, getSite, SITES } from '../../../data/sites';
import { findPhoto } from '../../../store/selectors';
import { useNewsroom } from '../../../store/useNewsroom';
import type { Article, ArticlePriority, SiteId } from '../../../types';
import { formatCompact } from '../../../utils/format';
import { blocksToPlainText, countWords, readingTime } from '../../../utils/text';
import { PRIORITY_META } from '../../../utils/workflow';

interface ArticleSettingsPanelProps {
  article: Article;
  onChange: (changes: Partial<Article>) => void;
}

/** Sidebar cards: placement, featured image, options and statistics. */
export function ArticleSettingsPanel({ article, onChange }: ArticleSettingsPanelProps) {
  const { state } = useNewsroom();
  const [pickerOpen, setPickerOpen] = useState(false);
  const site = getSite(article.siteId);
  const featured = findPhoto(state.photos, article.featuredImageId);

  const tagOptions = useMemo(
    () => [...new Set(state.articles.filter((a) => a.siteId === article.siteId).flatMap((a) => a.tags))].sort(),
    [state.articles, article.siteId],
  );

  const text = blocksToPlainText(article.body);
  const words = countWords(`${article.lead} ${text}`);

  return (
    <Stack spacing={2.5}>
      <Card>
        <CardHeader title="Placement" />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Site"
              value={article.siteId}
              onChange={(e) => {
                const siteId = e.target.value as SiteId;
                const categories = getSite(siteId).categories;
                onChange({ siteId, category: categories.includes(article.category) ? article.category : categories[0] });
              }}
              fullWidth
            >
              {SITES.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Category" value={article.category} onChange={(e) => onChange({ category: e.target.value })} fullWidth>
              {site.categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1.5}>
              <TextField
                select
                label="Priority"
                value={article.priority}
                onChange={(e) => onChange({ priority: e.target.value as ArticlePriority })}
                fullWidth
              >
                {(Object.keys(PRIORITY_META) as ArticlePriority[]).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Author" value={article.authorId} onChange={(e) => onChange({ authorId: e.target.value })} fullWidth>
                {AUTHORS.map((author) => (
                  <MenuItem key={author.id} value={author.id}>
                    {author.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Autocomplete
              multiple
              freeSolo
              options={tagOptions}
              value={article.tags}
              onChange={(_, tags) => onChange({ tags: [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))] })}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tag and press Enter" />}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Featured image" />
        <CardContent sx={{ pt: 0 }}>
          {featured ? (
            <Stack spacing={1}>
              <Box component="img" src={featured.thumbnailUrl} alt={featured.title} sx={{ width: '100%', borderRadius: 2, aspectRatio: '16 / 10', objectFit: 'cover' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {featured.title} · {featured.credit}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setPickerOpen(true)}>
                  Change
                </Button>
                <Button size="small" color="error" onClick={() => onChange({ featuredImageId: undefined })}>
                  Remove
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Button fullWidth variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} onClick={() => setPickerOpen(true)} sx={{ py: 3, borderStyle: 'dashed' }}>
              Choose featured image
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Options" />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={1}>
            <FormControlLabel control={<Switch checked={article.isPremium} onChange={(e) => onChange({ isPremium: e.target.checked })} />} label="Premium (paywall)" />
            <FormControlLabel
              control={<Switch checked={article.allowComments} onChange={(e) => onChange({ allowComments: e.target.checked })} />}
              label="Allow comments"
            />
            <TextField
              label="Notes for editors"
              value={article.editorNotes}
              onChange={(e) => onChange({ editorNotes: e.target.value })}
              multiline
              minRows={2}
              fullWidth
              helperText="Internal – never shown to readers."
              sx={{ mt: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Statistics" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              ['Words', String(words)],
              ['Reading time', `${readingTime(words)} min`],
              ['Blocks', String(article.body.length)],
              ['Characters', String(text.length)],
              ...(article.publishedAt
                ? [
                    ['Views', formatCompact(article.views)],
                    ['Comments', String(article.comments)],
                  ]
                : []),
            ].map(([label, value]) => (
              <div key={label}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
              </div>
            ))}
          </Box>
        </CardContent>
      </Card>

      <MediaPickerDialog
        open={pickerOpen}
        kind="photo"
        selectedId={article.featuredImageId}
        onClose={() => setPickerOpen(false)}
        onSelect={(featuredImageId) => {
          onChange({ featuredImageId });
          setPickerOpen(false);
        }}
      />
    </Stack>
  );
}
