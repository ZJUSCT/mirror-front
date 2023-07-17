import React from 'react';
import { Link, Grid, Hidden } from '@mui/material';
import { MirrorDto } from '../types/mirror';

export default ({ data }: { data: MirrorDto[] }) => {
  const caps: { [key: string]: boolean } = {};

  data.forEach(mirror => {
    if (mirror.id.length < 0) {
      throw new Error('mirror id empty');
    }
    const cap = mirror.id[0].toLocaleUpperCase();

    caps[cap] = true;
  });

  const buttons: React.ReactNode[] = [];

  for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i += 1) {
    const char = String.fromCharCode(i);
    if (caps[char]) {
      buttons.push(
        <Link href={`#${char}`} style={{ textDecoration: 'none' }}>
          {char}
        </Link>
      );
    };
  }

  return (
    <Hidden smDown>
      <Grid
        container
        flexDirection="column"
        flexWrap="nowrap"
        spacing={1}
        sx={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          width: 'fit-content',
        }}
      >
        {buttons.map(fab => (
          <Grid item>{fab}</Grid>
        ))}
      </Grid>
    </Hidden>
  );
};
