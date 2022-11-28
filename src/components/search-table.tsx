import React from 'react';
import { Box, Grid } from '@mui/material';
import SearchItemCard from './search-item-card';
import { Mirror } from '../types/mirror';

export default (props: { queryResults: Mirror[] }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Grid
      container
      spacing={{ xs: 2 }}
      columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      alignItems="stretch"
    >
      {props.queryResults?.map((item, i) => (
        <Grid item xs={1} key={i}>
          <SearchItemCard queryItem={item} />
        </Grid>
      ))}
    </Grid>
  </Box>
);
