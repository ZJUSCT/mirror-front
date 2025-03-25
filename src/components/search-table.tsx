import React from 'react';
import { Grid2 as Grid, Typography } from '@mui/material';
import SearchItemCard from './search-item-card';
import { Mirror } from '../types/mirror';

export default (props: { queryResults: Mirror[]; searching: boolean }) => {
  const lexicoMap: { [key: string]: Mirror[] } = {};
  const caps: string[] = [];
  props.queryResults.forEach(mirror => {
    if (mirror.id.length < 0) {
      throw new Error('mirror id empty');
    }
    const cap = mirror.id[0].toLocaleUpperCase();

    if (lexicoMap[cap]) {
      lexicoMap[cap].push(mirror);
    } else {
      caps.push(cap);
      lexicoMap[cap] = [mirror];
    }
  });
  if (!props.searching) {
    caps.sort();
  }

  return (
    <Grid
      container
      spacing={2}
      columns={1}
      flexDirection="column"
      wrap="nowrap"
    >
      {props.searching ? (
        <Grid>
          <Grid
            container
            spacing={{ xs: 2 }}
            columns={{ xs: 2, sm: 2, md: 3, lg: 4 }}
            alignItems="stretch"
          >
            {props.queryResults.map(mirror => (
              <Grid key={mirror.id} size={1}>
                <SearchItemCard queryItem={mirror} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      ) : (
        caps.map(cap => (
          <Grid key={cap}>
            <Typography gutterBottom variant="h6" component="div" id={cap}>
              {cap}
            </Typography>
            <Grid
              container
              spacing={{ xs: 2 }}
              columns={{ xs: 2, sm: 2, md: 3, lg: 4 }}
              alignItems="stretch"
            >
              {lexicoMap[cap].map(mirror => (
                <Grid key={mirror.id} size={1}>
                  <SearchItemCard queryItem={mirror} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))
      )}
    </Grid>
  );
};
