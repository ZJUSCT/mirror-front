import React from 'react';
import { Typography, useTheme } from '@mui/material';

export default ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  return (
    <Typography
      component="code"
      style={{
        color: theme.palette.text.disabled,
        backgroundColor: theme.palette.divider,
        padding: '2px 4px',
        borderRadius: '4px',
      }}
    >
      {children}
    </Typography>
  );
};
