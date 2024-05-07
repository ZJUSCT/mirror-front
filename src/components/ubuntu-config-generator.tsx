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

type ConfigStyle = 'default' | 'new' | 'old';

const ubuntuVersionMap: Record<number | string, string> = {
  2410: 'oracular',
  2404: 'noble',
  2310: 'mantic',
  2304: 'lunar',
  2210: 'kinetic',
  2204: 'jammy',
  2004: 'focal',
  1804: 'bionic',
  1604: 'xenial',
  1404: 'trusty',
};

const isLTSVersion = (version: number) => {
  return Math.floor(version / 100) % 2 === 0 && version % 100 === 4;
};

const configGenOld = (
  version: number | string,
  enableHTTPS: boolean,
  enableSrc: boolean,
  enableProposed: boolean,
  enableSecurity: boolean,
  ubuntuVariant: string
) => {
  const ubuntuName = ubuntuVersionMap[version];
  const httpProtocol = enableHTTPS ? 'https' : 'http';
  const proposedText = enableProposed ? '' : '# ';
  const securityRepo = enableSecurity
    ? 'mirrors.zju.edu.cn'
    : 'security.ubuntu.com';
  let sources = `deb ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName} main restricted universe multiverse
  deb ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-updates main restricted universe multiverse
  deb ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-backports main restricted universe multiverse
  deb ${httpProtocol}://${securityRepo}/${ubuntuVariant}/ ${ubuntuName}-security main restricted universe multiverse`;
  if (enableSrc) {
    sources += `
  deb-src ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName} main restricted universe multiverse
  deb-src ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-updates main restricted universe multiverse
  deb-src ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-backports main restricted universe multiverse
  deb-src ${httpProtocol}://${securityRepo}/${ubuntuVariant}/ ${ubuntuName}-security main restricted universe multiverse`;
  }

  if (enableProposed) {
    sources += `
  ${proposedText}deb ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-proposed main restricted universe multiverse`;
    if (enableSrc) {
      sources += `
  ${proposedText}deb-src ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/ ${ubuntuName}-proposed main restricted universe multiverse`;
    }
  }
  return sources;
};

const configGenNew = (
  version: number | string,
  enableHTTPS: boolean,
  enableSrc: boolean,
  enableProposed: boolean,
  enableSecurity: boolean,
  ubuntuVariant: string
) => {
  const ubuntuName = ubuntuVersionMap[version];
  const httpProtocol = enableHTTPS ? 'https' : 'http';
  const debSrcText = enableSrc ? ' deb-src' : '';
  const securityRepo = enableSecurity
    ? 'mirrors.zju.edu.cn'
    : 'security.ubuntu.com';
  let sources = `Types: deb${debSrcText}
  URIs: ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/
  Suites: ${ubuntuName} ${ubuntuName}-updates ${ubuntuName}-backports
  Components: main restricted universe multiverse
  Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
  \u200b
  Types: deb${debSrcText}
  URIs: ${httpProtocol}://${securityRepo}/${ubuntuVariant}/
  Suites: ${ubuntuName}-security
  Components: main restricted universe multiverse
  Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
  `;
  if (enableProposed) {
    sources += `\u200b
  Types: deb${debSrcText}
  URIs: ${httpProtocol}://mirrors.zju.edu.cn/${ubuntuVariant}/
  Suites: ${ubuntuName}-proposed
  Components: main restricted universe multiverse
  Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
  `;
  }
  return sources;
};

export default ({ ubuntuVariant }: { ubuntuVariant: string }) => {
  const [version, setVersion] = useState(
    Object.keys(ubuntuVersionMap)
      .reverse()
      .filter(v => isLTSVersion(parseInt(v, 10)))[0]
  );
  const [enableHTTPS, setEnableHTTPS] = useState(true);
  const [enableSrc, setEnableSrc] = useState(false);
  const [enableProposed, setEnableProposed] = useState(false);
  const [enableSecurity, setEnableSecurity] = useState(true);
  const [confStyle, setConfStyle] = useState('default' as ConfigStyle);
  const newConfAvailable = () => parseInt(version, 10) >= 2404;
  const shouldUseNewConf = () => newConfAvailable() && confStyle !== 'old';

  return (
    <Box>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-end"
      >
        <Grid item sx={{ mb: 1 }}>
          <Typography component="p">请选择您的 Ubuntu 版本：</Typography>
        </Grid>
        <Grid item>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">
              <Trans>版本</Trans>
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              label="Age"
              onChange={event => {
                setVersion(event.target.value);
              }}
              defaultValue={version}
            >
              {Object.keys(ubuntuVersionMap)
                .reverse()
                .map((v: string) => {
                  const item = parseInt(v, 10);
                  let desc = (item / 100).toFixed(2);
                  if (isLTSVersion(item)) desc += ' LTS';
                  desc += ` (${ubuntuVersionMap[item]})`;
                  return (
                    <MenuItem key={item} value={item}>
                      {desc}
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
              checked={enableHTTPS}
              onChange={e => setEnableHTTPS(e.target.checked)}
            />
          }
          label="启用 HTTPS （容器镜像可能默认不支持）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={enableSrc}
              onChange={e => setEnableSrc(e.target.checked)}
            />
          }
          label="启用源码源（默认禁用以提高速度）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={enableProposed}
              onChange={e => setEnableProposed(e.target.checked)}
            />
          }
          label="启用预发布软件源（不建议启用）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={enableSecurity}
              onChange={e => setEnableSecurity(e.target.checked)}
            />
          }
          label="启用安全更新镜像（仅推荐浙江大学校网内启用）"
        />
        <FormControlLabel
          control={
            <Switch
              disabled={!newConfAvailable()}
              checked={shouldUseNewConf()}
              onChange={e => setConfStyle(e.target.checked ? 'new' : 'old')}
            />
          }
          label="使用 DEB822 格式（Ubuntu 24.04 起）"
        />
      </FormGroup>
      <Grid container direction="column" my={2}>
        <Grid container direction="row">
          <Typography>软件源配置文件是</Typography>
          <code
            style={{ margin: '0 0.5rem', fontWeight: 'bold', color: 'brown' }}
          >
            {shouldUseNewConf()
              ? '/etc/apt/sources.list.d/ubuntu.sources'
              : '/etc/apt/sources.list'}
          </code>
        </Grid>
        <Grid container direction="row">
          <Typography>
            将系统自带的该文件做个备份，将该文件替换为下面内容，即可使用我们的软件源镜像。
          </Typography>
          {shouldUseNewConf() && (
            <>
              <Typography style={{ fontWeight: 'bold' }}>
                如果您从旧版本 Ubuntu 升级到该版本，可能需要同时备份并清除
              </Typography>
              <code style={{ margin: '0 0.5rem', fontWeight: 'bold' }}>
                /etc/apt/sources.list
              </code>
              <Typography style={{ fontWeight: 'bold' }}>的内容。</Typography>
            </>
          )}
        </Grid>
      </Grid>
      <CodeBlock language="bash">
        {shouldUseNewConf()
          ? configGenNew(
              version,
              enableHTTPS,
              enableSrc,
              enableProposed,
              enableSecurity,
              ubuntuVariant
            )
          : configGenOld(
              version,
              enableHTTPS,
              enableSrc,
              enableProposed,
              enableSecurity,
              ubuntuVariant
            )}
      </CodeBlock>
    </Box>
  );
};
