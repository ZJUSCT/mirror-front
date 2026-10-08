import { useId, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';

import ConfigCodeBlock from './ConfigCodeBlock';
import MuiThemeProvider from './MuiThemeProvider';
import useMirrorGuideOptions, {
  selectedMirrorOrigin,
} from './useMirrorGuideOptions';

type Release = 'trixie' | 'bookworm' | 'bullseye' | 'testing' | 'sid';

interface ReleaseDetails {
  label: string;
  deb822: boolean;
  sid?: boolean;
  nonFreeComponents: string;
}

const releases: Record<Release, ReleaseDetails> = {
  trixie: {
    label: 'Debian 13 (trixie)',
    deb822: true,
    nonFreeComponents: 'non-free non-free-firmware',
  },
  bookworm: {
    label: 'Debian 12 (bookworm)',
    deb822: true,
    nonFreeComponents: 'non-free non-free-firmware',
  },
  bullseye: {
    label: 'Debian 11 (bullseye)',
    deb822: false,
    nonFreeComponents: 'non-free',
  },
  testing: {
    label: 'Debian testing',
    deb822: true,
    nonFreeComponents: 'non-free non-free-firmware',
  },
  sid: {
    label: 'Debian sid',
    deb822: true,
    sid: true,
    nonFreeComponents: 'non-free non-free-firmware',
  },
};

const signingKey = '/usr/share/keyrings/debian-archive-keyring.gpg';

function componentsFor(release: Release, nonFree: boolean) {
  return [
    'main',
    'contrib',
    ...(nonFree ? [releases[release].nonFreeComponents] : []),
  ].join(' ');
}

function aptLine(
  type: 'deb' | 'deb-src',
  endpoint: string,
  suite: string,
  components: string
) {
  const root = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  return `${type} ${root} ${suite} ${components}`;
}

function traditionalConfig({
  endpoint,
  securityEndpoint,
  release,
  source,
  nonFree,
  mirrorSecurity,
}: {
  endpoint: string;
  securityEndpoint: string;
  release: Release;
  source: boolean;
  nonFree: boolean;
  mirrorSecurity: boolean;
}) {
  const components = componentsFor(release, nonFree);
  const pair = (target: string, suite: string) => [
    aptLine('deb', target, suite, components),
    ...(source ? [aptLine('deb-src', target, suite, components)] : []),
  ];

  if (releases[release].sid) return [...pair(endpoint, 'sid'), ''].join('\n');

  return [
    ...pair(endpoint, release),
    '',
    ...pair(endpoint, `${release}-updates`),
    '',
    ...pair(endpoint, `${release}-backports`),
    '',
    mirrorSecurity
      ? '# 以下安全更新软件源为镜像站配置'
      : '# 以下安全更新软件源为官方源配置',
    ...pair(securityEndpoint, `${release}-security`),
    '',
  ].join('\n');
}

function deb822Stanza(
  type: 'deb' | 'deb-src',
  endpoint: string,
  suites: string,
  components: string
) {
  return [
    `Types: ${type}`,
    `URIs: ${endpoint}`,
    `Suites: ${suites}`,
    `Components: ${components}`,
    `Signed-By: ${signingKey}`,
  ].join('\n');
}

function deb822Config({
  endpoint,
  securityEndpoint,
  release,
  source,
  nonFree,
  mirrorSecurity,
}: {
  endpoint: string;
  securityEndpoint: string;
  release: Release;
  source: boolean;
  nonFree: boolean;
  mirrorSecurity: boolean;
}) {
  const components = componentsFor(release, nonFree);
  const regularSuites = releases[release].sid
    ? 'sid'
    : `${release} ${release}-updates ${release}-backports`;
  const result = [
    deb822Stanza('deb', endpoint, regularSuites, components),
    ...(source
      ? ['', deb822Stanza('deb-src', endpoint, regularSuites, components)]
      : []),
  ];

  if (!releases[release].sid) {
    result.push(
      '',
      mirrorSecurity
        ? '# 以下安全更新软件源为镜像站配置'
        : '# 以下安全更新软件源为官方源配置',
      deb822Stanza('deb', securityEndpoint, `${release}-security`, components)
    );
    if (source) {
      result.push(
        '',
        deb822Stanza(
          'deb-src',
          securityEndpoint,
          `${release}-security`,
          components
        )
      );
    }
  }

  result.push('');
  return result.join('\n');
}

function DebianConfigContent() {
  const versionLabelId = useId();
  const options = useMirrorGuideOptions();
  const origin = selectedMirrorOrigin(options);
  const endpoint = `${origin}/debian`;
  const [release, setRelease] = useState<Release>('trixie');
  const [useDeb822, setUseDeb822] = useState(true);
  const [source, setSource] = useState(false);
  const [nonFree, setNonFree] = useState(true);
  const [mirrorSecurity, setMirrorSecurity] = useState(false);
  const releaseDetails = releases[release];
  const deb822Enabled = releaseDetails.deb822 && useDeb822;
  const securityEndpoint = mirrorSecurity
    ? `${origin}/debian-security`
    : `${options.https ? 'https' : 'http'}://security.debian.org/debian-security`;
  const filepath = deb822Enabled
    ? '/etc/apt/sources.list.d/debian.sources'
    : '/etc/apt/sources.list';
  const config = useMemo(
    () =>
      deb822Enabled
        ? deb822Config({
            endpoint,
            securityEndpoint,
            release,
            source,
            nonFree,
            mirrorSecurity,
          })
        : traditionalConfig({
            endpoint,
            securityEndpoint,
            release,
            source,
            nonFree,
            mirrorSecurity,
          }),
    [
      deb822Enabled,
      endpoint,
      mirrorSecurity,
      nonFree,
      release,
      securityEndpoint,
      source,
    ]
  );

  function handleReleaseChange(event: SelectChangeEvent) {
    const nextRelease = event.target.value as Release;
    setRelease(nextRelease);
    setUseDeb822(releases[nextRelease].deb822);
  }

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <FormControl variant="standard" sx={{ width: '18rem', maxWidth: '100%' }}>
        <InputLabel id={versionLabelId}>Debian 版本</InputLabel>
        <Select
          labelId={versionLabelId}
          value={release}
          label="Debian 版本"
          onChange={handleReleaseChange}
          MenuProps={{ disableScrollLock: true }}
        >
          {(Object.entries(releases) as [Release, ReleaseDetails][]).map(
            ([value, details]) => (
              <MenuItem value={value} key={value}>
                {details.label}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
      <FormGroup sx={{ mt: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={options.https}
              onChange={(event) =>
                options.updateOptions({ https: event.target.checked })
              }
            />
          }
          label="使用 HTTPS"
        />
        <FormControlLabel
          control={
            <Switch
              checked={deb822Enabled}
              disabled={!releaseDetails.deb822}
              onChange={(event) => setUseDeb822(event.target.checked)}
            />
          }
          label="使用 DEB822 格式（Debian 12 起）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={source}
              onChange={(event) => setSource(event.target.checked)}
            />
          }
          label="启用源码源（默认禁用以提高更新速度）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={nonFree}
              onChange={(event) => setNonFree(event.target.checked)}
            />
          }
          label="启用非自由软件源"
        />
        <FormControlLabel
          control={
            <Switch
              checked={!releaseDetails.sid && mirrorSecurity}
              disabled={releaseDetails.sid}
              onChange={(event) => setMirrorSecurity(event.target.checked)}
            />
          }
          label="强制安全更新使用镜像（不推荐）"
        />
      </FormGroup>
      {options.https && (
        <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
          使用 HTTPS 软件源前，可能需要安装 CA 证书：{' '}
          <Box component="code">
            {options.sudo ? 'sudo ' : ''}apt install ca-certificates
          </Box>
          。如果当前无法通过 HTTPS 更新软件包，请先切换回 HTTP 完成安装。
        </Alert>
      )}
      {!releaseDetails.sid && (
        <Alert
          severity={mirrorSecurity ? 'warning' : 'info'}
          variant="outlined"
          sx={{ my: 2 }}
        >
          {mirrorSecurity
            ? '镜像同步可能存在延迟，生产环境可能无法及时获得最新安全更新。'
            : '安全更新保持使用 Debian 官方源；普通更新和软件包使用当前选择的镜像服务。校内用户无法访问公网时需要勾选此项。'}
        </Alert>
      )}
      <Typography component="p" sx={{ my: 1 }}>
        将系统自带配置文件备份后，把以下内容写入{' '}
        <Box
          component="code"
          sx={{ color: 'primary.main', overflowWrap: 'anywhere' }}
        >
          {filepath}
        </Box>
        ：
      </Typography>
      <ConfigCodeBlock
        value={config}
        language={deb822Enabled ? 'yaml' : 'properties'}
      />
      {deb822Enabled && (
        <Typography color="text.secondary" variant="body2">
          如果系统由旧版本升级而来，请同时检查并备份旧的
          /etc/apt/sources.list，避免两套配置重复生效。
          {release !== 'bookworm' && release !== 'bullseye'
            ? '也可以使用 apt modernize-sources 转换现有配置。'
            : null}
        </Typography>
      )}
    </Box>
  );
}

export default function DebianConfig() {
  return (
    <MuiThemeProvider>
      <DebianConfigContent />
    </MuiThemeProvider>
  );
}

export function DebianOmvConfig() {
  const options = useMirrorGuideOptions();
  const origin = selectedMirrorOrigin(options);
  return (
    <ConfigCodeBlock
      value={[
        `omv-env set OMV_APT_KERNEL_BACKPORTS_REPOSITORY_URL "${origin}/debian"`,
        `omv-env set OMV_APT_SECURITY_REPOSITORY_URL "${origin}/debian-security"`,
      ].join('\n')}
      language="bash"
    />
  );
}
