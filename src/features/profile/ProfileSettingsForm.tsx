import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { SITES } from '../../data/sites';
import { useNotify } from '../../hooks/useNotify';
import { useNewsroom } from '../../store/useNewsroom';
import type { EditorProfile, NotificationPreferences, SiteId } from '../../types';
import { BIO_MAX, validateProfile, type ProfileErrors } from './validateProfile';

const LANGUAGE_OPTIONS = ['English', 'Polish', 'German', 'French', 'Spanish', 'Italian', 'Ukrainian'];
const BEAT_OPTIONS = ['Politics', 'Economy', 'Elections', 'Technology policy', 'Climate', 'Health', 'Culture', 'Sport', 'Crime', 'Education'];

const NOTIFICATION_LABELS: Record<keyof NotificationPreferences, { label: string; description: string }> = {
  emailOnReview: { label: 'Review requests', description: 'Email me when an article is submitted for review.' },
  emailOnPublish: { label: 'Publication confirmations', description: 'Email me when my article goes live.' },
  pushBreakingNews: { label: 'Breaking news alerts', description: 'Push notification for every breaking story.' },
  weeklyDigest: { label: 'Weekly digest', description: 'A Monday summary of newsroom performance.' },
};

/** Editable profile and notification preferences. */
export function ProfileSettingsForm({ profile }: { profile: EditorProfile }) {
  const { actions } = useNewsroom();
  const notify = useNotify();
  const [draft, setDraft] = useState<EditorProfile>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const set = <K extends keyof EditorProfile>(key: K, value: EditorProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (errors[key as keyof ProfileErrors]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleSite = (siteId: SiteId) => {
    const siteIds = draft.siteIds.includes(siteId) ? draft.siteIds.filter((id) => id !== siteId) : [...draft.siteIds, siteId];
    set('siteIds', siteIds);
    if (!siteIds.includes(draft.defaultSiteId) && siteIds[0]) set('defaultSiteId', siteIds[0]);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateProfile(draft);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      notify('Please fix the highlighted fields.', 'error');
      return;
    }
    const { id: _id, ...changes } = draft;
    actions.updateProfile(changes);
    notify('Profile saved.');
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader title="Personal information" subheader="Visible to everyone in the newsroom" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full name" value={draft.name} onChange={(e) => set('name', e.target.value)} error={Boolean(errors.name)} helperText={errors.name} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Role" value={draft.role} fullWidth disabled helperText="Roles are managed by the editor-in-chief." />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} error={Boolean(errors.email)} helperText={errors.email} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" value={draft.phone} onChange={(e) => set('phone', e.target.value)} error={Boolean(errors.phone)} helperText={errors.phone} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Location" value={draft.location} onChange={(e) => set('location', e.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Default site for new articles"
                    value={draft.defaultSiteId}
                    onChange={(e) => set('defaultSiteId', e.target.value as SiteId)}
                    fullWidth
                  >
                    {SITES.filter((site) => draft.siteIds.includes(site.id)).map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        {site.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Bio"
                    value={draft.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                    error={Boolean(errors.bio)}
                    helperText={errors.bio ?? `${draft.bio.length}/${BIO_MAX}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={BEAT_OPTIONS}
                    value={draft.beats}
                    onChange={(_, value) => set('beats', value)}
                    renderInput={(params) => <TextField {...params} label="Beats" placeholder="Add beat" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    multiple
                    options={LANGUAGE_OPTIONS}
                    value={draft.languages}
                    onChange={(_, value) => set('languages', value)}
                    renderInput={(params) => <TextField {...params} label="Languages" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="X handle" value={draft.social.x ?? ''} onChange={(e) => set('social', { ...draft.social, x: e.target.value })} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="LinkedIn" value={draft.social.linkedin ?? ''} onChange={(e) => set('social', { ...draft.social, linkedin: e.target.value })} fullWidth />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Card>
              <CardHeader title="Sites" subheader="Publications you edit" />
              <CardContent sx={{ pt: 0 }}>
                <FormControl error={Boolean(errors.siteIds)} component="fieldset" variant="standard">
                  <FormLabel component="legend" sx={{ display: 'none' }}>
                    Sites
                  </FormLabel>
                  <FormGroup>
                    {SITES.map((site) => (
                      <FormControlLabel
                        key={site.id}
                        control={<Checkbox checked={draft.siteIds.includes(site.id)} onChange={() => toggleSite(site.id)} />}
                        label={site.name}
                      />
                    ))}
                  </FormGroup>
                  {errors.siteIds && <FormHelperText>{errors.siteIds}</FormHelperText>}
                </FormControl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Notifications" />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  {(Object.keys(NOTIFICATION_LABELS) as (keyof NotificationPreferences)[]).map((key) => (
                    <FormControlLabel
                      key={key}
                      sx={{ alignItems: 'flex-start', mx: 0, justifyContent: 'space-between' }}
                      labelPlacement="start"
                      control={
                        <Switch
                          checked={draft.notifications[key]}
                          onChange={(e) => set('notifications', { ...draft.notifications, [key]: e.target.checked })}
                        />
                      }
                      label={
                        <div>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {NOTIFICATION_LABELS[key].label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {NOTIFICATION_LABELS[key].description}
                          </Typography>
                        </div>
                      }
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              color="inherit"
              disabled={!dirty}
              onClick={() => {
                setDraft(profile);
                setErrors({});
              }}
            >
              Discard changes
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={!dirty}>
              Save profile
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
