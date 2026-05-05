import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KPICard from './KPICard';

const mockSubscription = {
  type: 'Premium Membership',
  status: 'Active',
  startDate: '2024-01-01',
  nextBillingDate: '2024-04-01',
  amount: 49.99,
  features: [
    'Unlimited Gym Access',
    'Access to All Classes',
    'Personal Trainer Sessions',
    'Locker Room Access',
    'Nutrition Consultation',
  ],
};

const subscriptionMetrics = [
  {
    label: 'Plan Status',
    value: mockSubscription.status,
    trend: 'up' as const,
    trendPercent: 100,
    tooltip: 'Current subscription state',
  },
  {
    label: 'Start Date',
    value: 'Jan 1, 2024',
    trend: 'neutral' as const,
    tooltip: 'When the current membership started',
  },
  {
    label: 'Next Billing',
    value: 'Apr 1, 2024',
    trend: 'neutral' as const,
    tooltip: 'Upcoming billing date',
  },
  {
    label: 'Monthly Fee',
    value: '$49.99',
    trend: 'up' as const,
    trendPercent: 0,
    tooltip: 'Recurring membership amount',
  },
];

const SubscriptionDashboard: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 5,
          background: 'linear-gradient(135deg, rgba(20,184,166,0.14) 0%, rgba(34,197,94,0.12) 100%)',
          border: '1px solid rgba(17, 24, 39, 0.08)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Chip
                icon={<VerifiedIcon />}
                label="Member Experience"
                sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.72)', fontWeight: 700 }}
              />
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.03em' }}>
                My Gym Subscription
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                Review your active plan, billing timeline, and included benefits from one polished dashboard.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" startIcon={<DownloadIcon />} sx={{ borderRadius: 999 }}>
                Download Invoice
              </Button>
              <Button variant="outlined" startIcon={<HistoryIcon />} sx={{ borderRadius: 999, borderColor: 'rgba(17, 24, 39, 0.16)' }}>
                View History
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {subscriptionMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <KPICard data={metric} />
          </Grid>
        ))}
      </Grid>

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(17, 24, 39, 0.08)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {mockSubscription.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active since {mockSubscription.startDate}
              </Typography>
            </Box>
            <Chip
              label={mockSubscription.status}
              color="success"
              sx={{ fontWeight: 700, px: 1.5 }}
            />
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Stack spacing={0.8} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.03)' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    Billing Date
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800}>
                  {mockSubscription.nextBillingDate}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={0.8} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.03)' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentsIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    Monthly Fee
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800}>
                  ${mockSubscription.amount.toFixed(2)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={0.8} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.03)' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <VerifiedIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    Access Level
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800}>
                  Premium Access
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={800} gutterBottom>
            Included Benefits
          </Typography>
          <List disablePadding>
            {mockSubscription.features.map((feature) => (
              <ListItem key={feature} disableGutters sx={{ py: 0.7 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={feature}
                  primaryTypographyProps={{ fontWeight: 600, color: 'text.primary' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubscriptionDashboard;