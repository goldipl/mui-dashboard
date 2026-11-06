import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { Link as RouterLink } from 'react-router';
import { SITES } from '../../data/sites';
import type { SiteId } from '../../types';

/** Donut chart with the share of articles per site and a clickable legend. */
export function SiteShareChart({ counts }: { counts: Record<SiteId, number> }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Content by site" subheader={`${total} articles in total`} />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <PieChart
            height={210}
            hideLegend
            series={[
              {
                data: SITES.map((site) => ({ id: site.id, value: counts[site.id], label: site.name, color: site.color })),
                innerRadius: 62,
                outerRadius: 96,
                paddingAngle: 2,
                cornerRadius: 4,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
          />
          <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <Typography variant="h4" component="p">
              {total}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              articles
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {SITES.map((site) => (
            <Stack key={site.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: site.color, flexShrink: 0 }} />
              <Link component={RouterLink} to={`/sites/${site.id}`} underline="hover" color="inherit" sx={{ flex: 1, fontSize: 14 }}>
                {site.name}
              </Link>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {counts[site.id]}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', width: 40, textAlign: 'right' }}>
                {total ? Math.round((counts[site.id] / total) * 100) : 0}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
