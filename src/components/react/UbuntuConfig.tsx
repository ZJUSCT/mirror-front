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

type Release = 'stonking' | 'resolute' | 'noble' | 'questing' | 'jammy';

interface ReleaseDetails {
  label: string;
  deb822: boolean;
}

interface UbuntuConfigProps {
  defaultHttps?: boolean;
  repository?: 'ubuntu' | 'ubuntu-ports';
}

const releases: Record<Release, ReleaseDetails> = {
  resolute: { label: 'Ubuntu 26.04 LTS (resolute)', deb822: true },
  noble: { label: 'Ubuntu 24.04 LTS (noble)', deb822: true },
  jammy: { label: 'Ubuntu 22.04 LTS (jammy)', deb822: false },
  questing: { label: 'Ubuntu 25.10 (questing)', deb822: true },
  stonking: { label: 'Ubuntu 26.10 (stonking)', deb822: true },
};
const components = 'main restricted universe multiverse';
const signingKey = '/usr/share/keyrings/ubuntu-archive-keyring.gpg';

function aptLine(type: 'deb' | 'deb-src', endpoint: string, suite: string) {
  const root = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  return `${type} ${root} ${suite} ${components}`;
}

function traditionalConfig({
  endpoint,
  officialSecurityEndpoint,
  release,
  source,
  proposed,
  mirrorSecurity,
}: {
  endpoint: string;
  officialSecurityEndpoint: string;
  release: Release;
  source: boolean;
  proposed: boolean;
  mirrorSecurity: boolean;
}) {
  const securityEndpoint = mirrorSecurity ? endpoint : officialSecurityEndpoint;
  return [
    aptLine('deb', endpoint, release),
    ...(source ? [aptLine('deb-src', endpoint, release)] : []),
    aptLine('deb', endpoint, `${release}-updates`),
    ...(source ? [aptLine('deb-src', endpoint, `${release}-updates`)] : []),
    aptLine('deb', endpoint, `${release}-backports`),
    ...(source ? [aptLine('deb-src', endpoint, `${release}-backports`)] : []),
    '',
    mirrorSecurity
      ? '# 以下安全更新软件源为镜像站配置'
      : '# 以下安全更新软件源为官方源配置',
    aptLine('deb', securityEndpoint, `${release}-security`),
    ...(source
      ? [aptLine('deb-src', securityEndpoint, `${release}-security`)]
      : []),
    ...(proposed
      ? [
          '',
          '# 预发布软件源，不建议启用',
          aptLine('deb', endpoint, `${release}-proposed`),
          ...(source
            ? [aptLine('deb-src', endpoint, `${release}-proposed`)]
            : []),
        ]
      : []),
    '',
  ].join('\n');
}

function deb822Stanza(
  type: 'deb' | 'deb-src',
  endpoint: string,
  suites: string
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
  officialSecurityEndpoint,
  release,
  source,
  proposed,
  mirrorSecurity,
}: {
  endpoint: string;
  officialSecurityEndpoint: string;
  release: Release;
  source: boolean;
  proposed: boolean;
  mirrorSecurity: boolean;
}) {
  const securityEndpoint = mirrorSecurity ? endpoint : officialSecurityEndpoint;
  const regularSuites = `${release} ${release}-updates ${release}-backports`;
  return [
    deb822Stanza('deb', endpoint, regularSuites),
    ...(source ? ['', deb822Stanza('deb-src', endpoint, regularSuites)] : []),
    '',
    mirrorSecurity
      ? '# 以下安全更新软件源为镜像站配置'
      : '# 以下安全更新软件源为官方源配置',
    deb822Stanza('deb', securityEndpoint, `${release}-security`),
    ...(source
      ? ['', deb822Stanza('deb-src', securityEndpoint, `${release}-security`)]
      : []),
    ...(proposed
      ? [
          '',
          '# 预发布软件源，不建议启用',
          deb822Stanza('deb', endpoint, `${release}-proposed`),
          ...(source
            ? ['', deb822Stanza('deb-src', endpoint, `${release}-proposed`)]
            : []),
        ]
      : []),
    '',
  ].join('\n');
}

function UbuntuConfigContent({
  defaultHttps,
  repository,
}: Required<UbuntuConfigProps>) {
  const versionLabelId = useId();
  const options = useMirrorGuideOptions({ https: defaultHttps });
  const endpoint = `${selectedMirrorOrigin(options)}/${repository}`;
  const officialSecurityEndpoint = `${options.https ? 'https' : 'http'}://${
    repository === 'ubuntu-ports'
      ? 'ports.ubuntu.com/ubuntu-ports/'
      : 'security.ubuntu.com/ubuntu/'
  }`;
  const [release, setRelease] = useState<Release>('resolute');
  const [useDeb822, setUseDeb822] = useState(true);
  const [source, setSource] = useState(false);
  const [proposed, setProposed] = useState(false);
  const [mirrorSecurity, setMirrorSecurity] = useState(false);
  const deb822Available = releases[release].deb822;
  const deb822Enabled = deb822Available && useDeb822;
  const filepath = deb822Enabled
    ? '/etc/apt/sources.list.d/ubuntu.sources'
    : '/etc/apt/sources.list';
  const config = useMemo(
    () =>
      deb822Enabled
        ? deb822Config({
            endpoint,
            officialSecurityEndpoint,
            release,
            source,
            proposed,
            mirrorSecurity,
          })
        : traditionalConfig({
            endpoint,
            officialSecurityEndpoint,
            release,
            source,
            proposed,
            mirrorSecurity,
          }),
    [
      deb822Enabled,
      endpoint,
      mirrorSecurity,
      officialSecurityEndpoint,
      proposed,
      release,
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
        <InputLabel id={versionLabelId}>Ubuntu 版本</InputLabel>
        <Select
          labelId={versionLabelId}
          value={release}
          label="Ubuntu 版本"
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
              disabled={!deb822Available}
              onChange={(event) => setUseDeb822(event.target.checked)}
            />
          }
          label="使用 DEB822 格式"
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
              checked={proposed}
              onChange={(event) => setProposed(event.target.checked)}
            />
          }
          label="启用 proposed 预发布软件源（不建议启用）"
        />
        <FormControlLabel
          control={
            <Switch
              checked={mirrorSecurity}
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
      <Alert
        severity={mirrorSecurity ? 'warning' : 'info'}
        variant="outlined"
        sx={{ my: 2 }}
      >
        {mirrorSecurity
          ? '镜像同步可能存在延迟，生产环境可能无法及时获得最新安全更新。'
          : '安全更新保持使用 Ubuntu 官方源；普通更新和软件包使用当前选择的镜像服务。校内用户无法访问公网时需要勾选此项。'}
      </Alert>
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
        </Typography>
      )}
    </Box>
  );
}

export default function UbuntuConfig({
  defaultHttps = false,
  repository = 'ubuntu',
}: UbuntuConfigProps) {
  return (
    <MuiThemeProvider>
      <UbuntuConfigContent
        defaultHttps={defaultHttps}
        repository={repository}
      />
    </MuiThemeProvider>
  );
}

export function UbuntuCertificateCommand() {
  const options = useMirrorGuideOptions();
  return (
    <ConfigCodeBlock
      value={`${options.sudo ? 'sudo ' : ''}apt install ca-certificates`}
      language="bash"
    />
  );
}
