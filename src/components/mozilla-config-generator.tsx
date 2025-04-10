import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  FormGroup,
} from '@mui/material';
import { Trans } from 'gatsby-plugin-react-i18next';
import CodeBlock from './code-block';

type ArchTypes = 'amd64' | 'arm64';
const archs: ArchTypes[] = ['amd64', 'arm64'];

const configGenOld = (arch: ArchTypes): string =>
  `deb [arch=${arch} signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://mirrors.zju.edu.cn/mozilla/apt mozilla main`;

const configGenNew = (arch: ArchTypes) => `
Types: deb
URIs: https://mirrors.zju.edu.cn/mozilla/apt
Suites: mozilla
Components: main
Signed-By: /etc/apt/keyrings/packages.mozilla.org.asc
Architectures: ${arch}
`;

export default () => {
  const [enableDeb822, setEnableDeb822] = useState(false);

  const [arch, setArch] = useState('amd64' as ArchTypes);

  return (
    <Box>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-end"
      >
        <Grid>
          <Typography component="p">请选择您的系统架构：</Typography>
        </Grid>
        <Grid>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="simple-select-helper-label">
              <Trans>系统架构</Trans>
            </InputLabel>
            <Select
              labelId="simple-select-helper-label"
              id="simple-select-helper"
              label="Age"
              onChange={event => {
                setArch(event.target.value as ArchTypes);
              }}
              defaultValue={arch}
            >
              {archs.map((v: ArchTypes) => {
                return (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={enableDeb822}
              onChange={e => setEnableDeb822(e.target.checked)}
            />
          }
          label="使用 DEB822 格式"
        />
      </FormGroup>
      <Grid container direction="column" my={2}>
        <Grid container direction="row">
          <Typography>请在</Typography>
          <code
            style={{
              margin: '0 0.5rem',
              fontWeight: 400,
              color: 'rgb(156, 39, 176)',
            }}
          >
            {enableDeb822
              ? '/etc/apt/sources.list.d/mozilla.sources'
              : '/etc/apt/sources.list.d/mozilla.list'}
          </code>
          <Typography>添加 APT 源：</Typography>
        </Grid>
      </Grid>
      <CodeBlock language="bash">
        {enableDeb822 ? configGenNew(arch) : configGenOld(arch)}
      </CodeBlock>
    </Box>
  );
};
