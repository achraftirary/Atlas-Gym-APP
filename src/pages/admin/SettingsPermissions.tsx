import React from 'react';
import { Box, Typography } from '@mui/material';

const SettingsPermissions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Roles & Permissions
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Define access levels for staff, trainers, and admins.
      </Typography>
    </Box>
  );
};

export default SettingsPermissions;
