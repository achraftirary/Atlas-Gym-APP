import React from 'react';
import { Box, Typography } from '@mui/material';

const Leads: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Leads
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Track inbound leads, trials, and conversion workflows.
      </Typography>
    </Box>
  );
};

export default Leads;
