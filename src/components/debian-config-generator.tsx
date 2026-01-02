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
const VERSION_SID = -2;
// const VERSION_TESTING = -1;

const debianVersionMap: Record<string, string> = {
  '13': 'trixie',
  '12': 'bookworm',
  '11': 'bullseye',
  '10': 'buster',
  '-1': 'testing',
  '-2': 'sid',
};
const debianVersions = Object.keys(debianVersionMap)
  .map(x => parseInt(x, 10))
  .sort()
  .reverse();

const configGenOld = (
  version: number,
  enableHTTPS: boolean,
  enableSrc: boolean,
  enableSecurity: boolean
) => {
  const codeName = debianVersionMap[version];
  const httpProtocol = enableHTTPS ? 'https' : 'http';
  const components =
    version >= 12 || version < 0
      ? 'main contrib non-free non-free-firmware'
      : 'main contrib non-free';

  const gr = (type: 'deb' | 'deb-src', uri: string, suite: string) =>
    `${type} ${httpProtocol}://${uri} ${suite} ${components}\n`;
  const g = (type: 'deb' | 'deb-src', suite: string) =>
    gr(type, 'mirrors.zju.edu.cn/debian/', suite);

  let sources = '';
  sources += g('deb', `${codeName}`);

  if (version !== VERSION_SID) {
    sources += g('deb', `${codeName}-updates`);
    sources += g('deb', `${codeName}-backports`);
    if (enableSecurity) {
      if (version > 10 || version < 0) {
        sources += gr(
          'deb',
          'mirrors.zju.edu.cn/debian-security/',
          `${codeName}-security`
        );
      } else {
        sources += gr(
          'deb',
          'mirrors.zju.edu.cn/debian-security/',
          'buster/updates'
        );
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (version > 10 || version < 0) {
        sources += gr(
          'deb',
          'security.debian.org/debian-security/',
          `${codeName}-security`
        );
      } else {
        sources += gr(
          'deb',
          'security.debian.org/debian-security/',
          'buster/updates'
        );
      }
    }
  }

  if (enableSrc) {
    sources += g('deb-src', `${codeName}`);
    if (version !== VERSION_SID) {
      sources += g('deb-src', `${codeName}-updates`);
      sources += g('deb-src', `${codeName}-backports`);
      if (enableSecurity) {
        if (version > 10 || version < 0) {
          sources += gr(
            'deb-src',
            'mirrors.zju.edu.cn/debian-security/',
            `${codeName}-security`
          );
        } else {
          sources += gr(
            'deb-src',
            'mirrors.zju.edu.cn/debian-security/',
            'buster/updates'
          );
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (version > 10 || version < 0) {
          sources += gr(
            'deb-src',
            'security.debian.org/debian-security/',
            `${codeName}-security`
          );
        } else {
          sources += gr(
            'deb-src',
            'security.debian.org/debian-security/',
            'buster/updates'
          );
        }
      }
    }
  }

  return sources;
};

const configGenNew = (
  version: number,
  enableHTTPS: boolean,
  enableSrc: boolean,
  enableSecurity: boolean
) => {
  const codeName = debianVersionMap[version];
  const httpProtocol = enableHTTPS ? 'https' : 'http';
  const debSrcText = enableSrc ? ' deb-src' : '';
  const components =
    version === VERSION_SID
      ? 'sid'
      : `${codeName} ${codeName}-updates ${codeName}-backports`;
  const securityRepo = enableSecurity
    ? 'mirrors.zju.edu.cn'
    : 'security.debian.org';

  let sources = `Types: deb${debSrcText}
URIs: ${httpProtocol}://mirrors.zju.edu.cn/debian/
Suites: ${components}
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg`;
  if (version !== VERSION_SID) {
    sources += `

Types: deb${debSrcText}
URIs: ${httpProtocol}://${securityRepo}/debian-security/
Suites: ${codeName}-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
  `;
  }
  return sources;
};

export default () => {
  const [version, setVersion] = useState(debianVersions[0]);
  const [enableHTTPS, setEnableHTTPS] = useState(true);
  const [enableSrc, setEnableSrc] = useState(false);
  const [enableSecurity, setEnableSecurity] = useState(true);
  const [confStyle, setConfStyle] = useState('default' as ConfigStyle);
  const newConfAvailable = () => version >= 12 || version < 0;
  const aptModernizeAvailable = () => version >= 13 || version < 0;
  const shouldUseNewConf = () => newConfAvailable() && confStyle !== 'old';

  return (
    <Box>
      <Grid sx={{ mb: 1 }}>
        <Typography component="p">请选择您的 Debian 版本：</Typography>
      </Grid>
      <Grid>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-helper-label">
            <Trans>版本</Trans>
          </InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            label="Age"
            onChange={event => {
              setVersion(event.target.value as number);
            }}
            defaultValue={version}
          >
            {debianVersions.map((v: number) => {
              const codeName = debianVersionMap[v];
              let desc = '';
              if (v > 0) {
                desc = `${v} (${codeName})`;
              } else {
                desc = codeName;
              }
              return (
                <MenuItem key={v} value={v}>
                  {desc}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
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
              disabled={version === VERSION_SID}
              checked={enableSecurity && version !== VERSION_SID}
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
          label="使用 DEB822 格式（Debian 12 起）"
        />
      </FormGroup>
      <Grid container direction="row" my={2} alignItems="center" gap={1}>
        <Grid>
          <Typography component="span">软件源配置文件是</Typography>
        </Grid>
        <Grid>
          <code
            style={{
              margin: '0 0.5rem',
              fontWeight: 'bold',
              color: 'brown',
              textWrap: 'wrap',
              wordBreak: 'break-word',
            }}
          >
            {shouldUseNewConf()
              ? '/etc/apt/sources.list.d/debian.sources'
              : '/etc/apt/sources.list'}
          </code>
        </Grid>
        <Grid>
          <Typography component="span">
            ，可以使用如下命令替换软件源配置文件:
          </Typography>
        </Grid>
      </Grid>
      <Grid my={2}>
        <CodeBlock language="bash">
          {shouldUseNewConf()
            ? "sudo sed -i 's@//.*.debian.org@//mirrors.zju.edu.cn@g' /etc/apt/sources.list.d/debian.sources"
            : `sudo sed -i 's@//.*.debian.org@//mirrors.zju.edu.cn@g' /etc/apt/sources.list`}
        </CodeBlock>
      </Grid>
      <Typography>
        或将系统自带的配置文件做个备份，将其替换为下面的内容，即可使用我们的软件源镜像。
      </Typography>
      <Grid my={2}>
        <CodeBlock language="bash">
          {shouldUseNewConf()
            ? configGenNew(version, enableHTTPS, enableSrc, enableSecurity)
            : configGenOld(version, enableHTTPS, enableSrc, enableSecurity)}
        </CodeBlock>
      </Grid>
      <Grid container direction="row" my={2}>
        {shouldUseNewConf() && (
          <>
            <Typography style={{ fontWeight: 'bold' }}>
              请注意: 如果您从旧版本 Debian 升级到该版本，可能需要同时备份并清除
            </Typography>
            <code style={{ margin: '0 0.5rem', fontWeight: 'bold' }}>
              /etc/apt/sources.list
            </code>
            <Typography style={{ fontWeight: 'bold' }}>的内容。</Typography>
            {aptModernizeAvailable() && (
              <>
                <Typography style={{ fontWeight: 'bold' }}>
                  您也可以使用
                </Typography>
                <code style={{ margin: '0 0.5rem', fontWeight: 'bold' }}>
                  apt modernize-sources
                </code>
                <Typography style={{ fontWeight: 'bold' }}>
                  来自动完成这一过程。
                </Typography>
              </>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};
