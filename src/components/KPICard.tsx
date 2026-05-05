import React from 'react';
import { Card, CardContent, Stack, Typography, Box, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { KPIData } from '../utils/kpiCalculator';

interface KPICardProps {
  data: KPIData;
  bgGradient?: string;
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({
  data,
  bgGradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(20, 184, 166, 0.08) 100%)',
  icon,
}) => {
  return (
    <Tooltip title={data.tooltip || ''}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(17, 24, 39, 0.08)',
          background: bgGradient,
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack spacing={1.5}>
            {/* Header with icon and trend */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                }}
              >
                {data.label}
              </Typography>
              {data.trend && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: data.trend === 'up' ? '#10b981' : data.trend === 'down' ? '#ef4444' : '#6b7280',
                    fontWeight: 600,
                  }}
                >
                  {data.trend === 'up' && <TrendingUpIcon sx={{ fontSize: '0.95rem', mr: 0.3 }} />}
                  {data.trend === 'down' && <TrendingDownIcon sx={{ fontSize: '0.95rem', mr: 0.3 }} />}
                  {data.trendPercent && `${data.trendPercent > 0 ? '+' : ''}${data.trendPercent}%`}
                </Box>
              )}
            </Stack>

            {/* Main value */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {data.value}
              </Typography>
              {data.unit && (
                <Typography variant="caption" color="text.secondary">
                  {data.unit}
                </Typography>
              )}
            </Box>

            {/* Icon or progress indicator */}
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  opacity: 0.7,
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default KPICard;
