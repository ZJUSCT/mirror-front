import CircleIcon from '@mui/icons-material/Circle';
import { Typography } from '@mui/material';
import React from 'react';
import { MirrorStatus } from '../types/mirror';

interface StatusInfo {
  content: string;
  color: string;
}

const statusInfoMap: { [key in MirrorStatus]: StatusInfo } = {
  succeeded: {
    content: 'succeeded',
    color: 'success.main',
  },
  syncing: {
    content: 'syncing',
    color: 'warning.main',
  },
  failed: {
    content: 'failed',
    color: 'error.main',
  },
  paused: {
    content: 'paused',
    color: 'warning.main',
  },
  cached: {
    content: 'cached',
    color: 'info.main',
  },
  unknown: {
    content: 'unknown',
    color: 'warning.main',
  },
};

export default ({
  status,
  fontSize,
}: {
  status: MirrorStatus;
  fontSize?: string | number;
}) => {
  const statusInfo: StatusInfo = statusInfoMap[status];
  return (
    <Typography
      variant="subtitle2"
      component="div"
      color={`${statusInfo.color}`}
      fontWeight={1000}
      fontSize={fontSize || 'inherit'}
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <CircleIcon sx={{ fontSize: '.8em', mr: 0.5 }} />
      {statusInfo.content.toUpperCase()}
    </Typography>
  );
};
