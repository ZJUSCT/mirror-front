import { useId, useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  type SelectChangeEvent,
} from '@mui/material';

import ConfigCodeBlock from './ConfigCodeBlock';
import MuiThemeProvider from './MuiThemeProvider';
import useMirrorGuideOptions, {
  selectedMirrorOrigin,
} from './useMirrorGuideOptions';

type InstallerNames = Record<string, string>;
type RepositoryMode = 'official' | 'community';

const operatingSystems: Record<string, string> = {
  Windows: 'Windows',
  MacOSX: 'macOS',
  Linux: 'Linux',
};
const installers: Record<string, InstallerNames> = {
  Windows: {
    'x86_64.exe': 'x86_64 EXE',
  },
  MacOSX: {
    'arm64.pkg': 'ARM64 安装包（Apple Silicon）',
    'x86_64.pkg': 'x86_64 安装包（Intel）',
    'arm64.sh': 'ARM64 Shell 安装器（Apple Silicon）',
    'x86_64.sh': 'x86_64 Shell 安装器（Intel）',
  },
  Linux: {
    'x86_64.sh': 'x86_64 Shell 安装器',
    'aarch64.sh': 'ARM64 Shell 安装器',
    'ppc64le.sh': 'ppc64le Shell 安装器',
    's390x.sh': 's390x Shell 安装器',
  },
};

const channels = [
  'conda-forge',
  'atztogo',
  'msys2',
  'bioconda',
  'menpo',
  'pytorch',
  'pytorch-lts',
  'simpleitk',
  'soumith',
  'auto',
  'biobakery',
  'c4aarch64',
  'caffe2',
  'deepmodeling',
  'dglteam',
  'fastai',
  'fermi',
  'idaholab',
  'intel',
  'matsci',
  'MindSpore',
  'mordred-descriptor',
  'numba',
  'ohmeta',
  'omnia',
  'Paddle',
  'peterjc123',
  'plotly',
  'psi4',
  'pytorch3d',
  'pytorch-test',
  'pyviz',
  'qiime2',
  'rapidsai',
  'rdkit',
  'stackless',
  'ursky',
  'viscid-hub',
] as const;

const enabledByDefault = new Set<string>(['conda-forge']);

function defaultChannelStatus(mode: RepositoryMode) {
  return Object.fromEntries(
    channels.map((channel) => [
      channel,
      mode === 'community'
        ? channel === 'conda-forge'
        : enabledByDefault.has(channel),
    ])
  );
}

function useMirrorOrigin() {
  return selectedMirrorOrigin(useMirrorGuideOptions());
}

function MinicondaInstallerContent() {
  const osLabelId = useId();
  const variantLabelId = useId();
  const [os, setOS] = useState('');
  const [variant, setVariant] = useState('');
  const mirrorOrigin = useMirrorOrigin();
  const installerName =
    os && variant ? `Miniconda3-latest-${os}-${variant}` : '';

  function handleOSChange(event: SelectChangeEvent) {
    setOS(event.target.value);
    setVariant('');
  }

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <FormControl
          variant="standard"
          sx={{ minWidth: { sm: 140 }, width: { xs: '100%', sm: 'auto' } }}
        >
          <InputLabel id={osLabelId}>操作系统</InputLabel>
          <Select
            labelId={osLabelId}
            value={os}
            onChange={handleOSChange}
            label="操作系统"
            MenuProps={{ disableScrollLock: true }}
          >
            {Object.entries(operatingSystems).map(([value, label]) => (
              <MenuItem value={value} key={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          variant="standard"
          sx={{ minWidth: { sm: 300 }, width: { xs: '100%', sm: 'auto' } }}
          disabled={!os}
        >
          <InputLabel id={variantLabelId}>系统架构及安装包类型</InputLabel>
          <Select
            labelId={variantLabelId}
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
            label="系统架构及安装包类型"
            MenuProps={{ disableScrollLock: true }}
          >
            {Object.entries(installers[os] ?? {}).map(([value, label]) => (
              <MenuItem value={value} key={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        disabled={!installerName}
        href={
          installerName
            ? `${mirrorOrigin}/anaconda/miniconda/${installerName}`
            : undefined
        }
        sx={{ mt: 2 }}
      >
        下载{installerName ? `（${installerName}）` : ''}
      </Button>
    </Box>
  );
}

function CondaConfigGenContent() {
  const mirrorOrigin = useMirrorOrigin();
  const [repositoryMode, setRepositoryMode] =
    useState<RepositoryMode>('official');
  const [showChannels, setShowChannels] = useState(false);
  const [channelStatus, setChannelStatus] = useState<Record<string, boolean>>(
    () => defaultChannelStatus('official')
  );
  const config = useMemo(() => {
    const selected = channels.filter((channel) => channelStatus[channel]);
    return [
      'channels:',
      ...(repositoryMode === 'official'
        ? ['  - defaults']
        : [...selected.map((channel) => `  - ${channel}`), '  - nodefaults']),
      'show_channel_urls: true',
      ...(repositoryMode === 'official'
        ? [
            'default_channels:',
            `  - ${mirrorOrigin}/anaconda/pkgs/main`,
            `  - ${mirrorOrigin}/anaconda/pkgs/r`,
            `  - ${mirrorOrigin}/anaconda/pkgs/msys2`,
          ]
        : []),
      ...(selected.length
        ? [
            'custom_channels:',
            ...selected.map(
              (channel) => `  ${channel}: ${mirrorOrigin}/anaconda/cloud`
            ),
          ]
        : []),
      '',
    ].join('\n');
  }, [channelStatus, mirrorOrigin, repositoryMode]);

  function handleRepositoryModeChange(value: string) {
    const mode = value as RepositoryMode;
    setRepositoryMode(mode);
    setChannelStatus(defaultChannelStatus(mode));
  }

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">软件源模式</FormLabel>
        <RadioGroup
          value={repositoryMode}
          onChange={(_event, value) => handleRepositoryModeChange(value)}
        >
          <FormControlLabel
            value="official"
            control={<Radio />}
            label="包含 Anaconda 官方仓库（defaults）"
          />
          <FormControlLabel
            value="community"
            control={<Radio />}
            label="仅使用社区频道（nodefaults）"
          />
        </RadioGroup>
        <FormHelperText>
          {repositoryMode === 'official'
            ? '包含 pkgs/main、pkgs/r 和 pkgs/msys2，使用前请确认符合 Anaconda 服务条款。'
            : '不配置 default_channels，并通过 nodefaults 阻止 conda 回落到 Anaconda 官方仓库。'}
        </FormHelperText>
      </FormControl>
      <FormControlLabel
        sx={{ display: 'flex', width: 'fit-content', mt: 1 }}
        control={
          <Switch
            checked={showChannels}
            onChange={(event) => setShowChannels(event.target.checked)}
          />
        }
        label="选择第三方频道"
      />
      <Collapse in={showChannels}>
        <FormGroup
          row
          sx={{
            maxHeight: '20rem',
            mt: 1,
            mb: 2,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            bgcolor:
              'color-mix(in srgb, var(--background) 42%, var(--surface))',
            '& .MuiFormControlLabel-root': {
              minWidth: '10rem',
              mr: 2,
            },
          }}
        >
          {channels.map((channel) => (
            <FormControlLabel
              key={channel}
              control={
                <Checkbox
                  checked={channelStatus[channel]}
                  disabled={
                    repositoryMode === 'community' && channel === 'conda-forge'
                  }
                  onChange={() =>
                    setChannelStatus((current) => ({
                      ...current,
                      [channel]: !current[channel],
                    }))
                  }
                />
              }
              label={channel}
            />
          ))}
        </FormGroup>
        {repositoryMode === 'community' && (
          <FormHelperText>
            conda-forge 是仅社区模式的基础频道，因此不能取消。
          </FormHelperText>
        )}
      </Collapse>
      <ConfigCodeBlock value={config} language="yaml" />
    </Box>
  );
}

export function MinicondaInstaller() {
  return (
    <MuiThemeProvider>
      <MinicondaInstallerContent />
    </MuiThemeProvider>
  );
}

export function CondaConfigGen() {
  return (
    <MuiThemeProvider>
      <CondaConfigGenContent />
    </MuiThemeProvider>
  );
}
