import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, delta, trend }) => {
  const color = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(17, 24, 39, 0.08)',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)'
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          <Chip label={delta} color={color} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
