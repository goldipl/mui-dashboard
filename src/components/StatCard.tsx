import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  /** Percentage change compared with the previous period. */
  delta?: number;
  caption?: string;
  trend?: number[];
}

/** KPI tile with an optional trend sparkline. */
export function StatCard({ label, value, icon, color = 'primary', delta, caption, trend }: StatCardProps) {
  const theme = useTheme();
  const main = theme.palette[color].main;
  const positive = (delta ?? 0) >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h4" component="p" sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </div>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: main,
              bgcolor: alpha(main, 0.12),
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center', minHeight: 40 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {delta !== undefined && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                {positive ? (
                  <TrendingUpRoundedIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownRoundedIcon fontSize="small" color="error" />
                )}
                <Typography variant="body2" sx={{ fontWeight: 700, color: positive ? 'success.main' : 'error.main' }}>
                  {positive ? '+' : ''}
                  {delta.toFixed(1)}%
                </Typography>
              </Stack>
            )}
            {caption && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {caption}
              </Typography>
            )}
          </Box>
          {trend && trend.length > 1 && (
            <Box sx={{ width: 110, height: 40 }}>
              <SparkLineChart data={trend} height={40} curve="natural" area color={main} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
