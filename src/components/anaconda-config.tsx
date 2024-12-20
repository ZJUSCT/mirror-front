import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  FormGroup,
  SelectProps,
  Checkbox,
  Collapse,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CodeBlock from './code-block2';

type HumanReadableInstallerName = Record<string, string>;

const prefix = 'https://mirrors.zju.edu.cn/anaconda/miniconda/';

const osNameDict: Record<string, string> = {
  Windows: 'Windows',
  MacOSX: 'macOS',
  Linux: 'Linux',
};
const installerDict: Record<string, HumanReadableInstallerName> = {
  '': {},
  'Windows': {
    'x86_64.exe': 'x86_64 EXE',
    'x86.exe': 'x86 EXE',
  },
  'MacOSX': {
    'arm64.pkg': 'ARM64 安装包 (Apple Silicon)',
    'x86_64.pkg': 'x86_64 安装包 (Intel)',
    'arm64.sh': 'ARM64 SH (Apple Silicon)',
    'x86_64.sh': 'x86_64 SH (Intel)',
    'x86.sh': 'x86 SH',
  },
  'Linux': {
    'x86_64.sh': 'x86_64 SH',
    'aarch64.sh': 'arm64 SH',
    'x86.sh': 'x86 SH',
    'armv7l.sh': 'armv7l SH',
    'ppc64le.sh': 'ppc64le SH',
    's390x.sh': 's390x SH',
  },
};

const mf3Prefix = 'https://mirrors.zju.edu.cn/miniforge/';
const mf3OsNameDict: Record<string, string> = {
  Windows: 'Windows',
  Darwin: 'macOS',
  Linux: 'Linux',
};
const mf3InstallerDict: Record<string, HumanReadableInstallerName> = {
  '': {},
  'Windows': {
    'x86_64.exe': 'x86_64 EXE',
  },
  'Darwin': {
    'arm64.sh': 'ARM64 SH (Apple Silicon)',
    'x86_64.sh': 'x86_64 SH (Intel)',
  },
  'Linux': {
    'x86_64.sh': 'x86_64 SH',
    'aarch64.sh': 'arm64 SH',
    'ppc64le.sh': 'ppc64le SH',
  },
};

const MinicondaInstaller = () => {
  const [os, setOS] = useState('');
  const [variant, setVariant] = useState('');
  const installerName =
    os && variant ? `Miniconda3-latest-${os}-${variant}` : '';

  const handleOSChange: SelectProps['onChange'] = event => {
    setOS(event.target.value as string);
    setVariant('');
  };

  const handleVariantChange: SelectProps['onChange'] = event => {
    setVariant(event.target.value as string);
  };

  return (
    <div>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="os-select-label">操作系统</InputLabel>
        <Select
          labelId="os-select-label"
          id="os-select"
          value={os}
          onChange={handleOSChange}
          label="操作系统"
        >
          {Object.keys(osNameDict).map(osKey => (
            <MenuItem value={osKey} key={osKey}>
              {osNameDict[osKey]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
        <InputLabel id="variant-select-label">
          系统架构 及 安装包类型
        </InputLabel>
        <Select
          labelId="variant-select-label"
          id="variant-select"
          value={variant}
          onChange={handleVariantChange}
          label="系统架构及安装包类型"
        >
          {Object.keys(installerDict[os]).map(k => (
            <MenuItem value={k} key={`${os}-${k}`}>
              {installerDict[os][k]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        sx={{ m: 1 }}
        disabled={!installerName}
        href={prefix + installerName}
      >
        <Typography textTransform="none">
          下载 {installerName && `(${installerName})`}
        </Typography>
      </Button>
    </div>
  );
};

const Miniforge3Installer = () => {
  const [os, setOS] = useState('');
  const [variant, setVariant] = useState('');
  const installerName = os && variant ? `Miniforge3-${os}-${variant}` : '';

  const handleOSChange: SelectProps['onChange'] = event => {
    setOS(event.target.value as string);
    setVariant('');
  };

  const handleVariantChange: SelectProps['onChange'] = event => {
    setVariant(event.target.value as string);
  };

  return (
    <div>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="os-select-label">操作系统</InputLabel>
        <Select
          labelId="os-select-label"
          id="os-select"
          value={os}
          onChange={handleOSChange}
          label="操作系统"
        >
          {Object.keys(mf3OsNameDict).map(osKey => (
            <MenuItem value={osKey} key={osKey}>
              {mf3OsNameDict[osKey]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
        <InputLabel id="variant-select-label">
          系统架构 及 安装包类型
        </InputLabel>
        <Select
          labelId="variant-select-label"
          id="variant-select"
          value={variant}
          onChange={handleVariantChange}
          label="系统架构及安装包类型"
        >
          {Object.keys(mf3InstallerDict[os]).map(k => (
            <MenuItem value={k} key={`${os}-${k}`}>
              {mf3InstallerDict[os][k]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        sx={{ m: 1 }}
        disabled={!installerName}
        href={mf3Prefix + installerName}
      >
        <Typography textTransform="none">
          下载 {installerName && `(${installerName})`}
        </Typography>
      </Button>
    </div>
  );
};

const baseConf = `channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.zju.edu.cn/anaconda/pkgs/main
  - https://mirrors.zju.edu.cn/anaconda/pkgs/r
  - https://mirrors.zju.edu.cn/anaconda/pkgs/msys2
`;

type ChannelOrigin = 'anaconda' | 'anaconda-r';
const channelOrigin: Record<string, ChannelOrigin> = {
  'conda-forge': 'anaconda',
  'msys2': 'anaconda',
  'bioconda': 'anaconda',
  'menpo': 'anaconda',
  'pytorch': 'anaconda',
  'pytorch-lts': 'anaconda',
  'simpleitk': 'anaconda',
  'nvidia': 'anaconda-r',
  'auto': 'anaconda',
  'biobakery': 'anaconda',
  'c4aarch64': 'anaconda',
  'caffe2': 'anaconda',
  'deepmodeling': 'anaconda',
  'dglteam': 'anaconda',
  'fastai': 'anaconda',
  'fermi': 'anaconda',
  'idaholab': 'anaconda',
  'intel': 'anaconda',
  'matsci': 'anaconda',
  'MindSpore': 'anaconda',
  'mordred-descriptor': 'anaconda',
  'numba': 'anaconda',
  'ohmeta': 'anaconda',
  'omnia': 'anaconda',
  'Paddle': 'anaconda',
  'peterjc123': 'anaconda',
  'plotly': 'anaconda',
  'psi4': 'anaconda',
  'pytorch3d': 'anaconda',
  'pyviz': 'anaconda',
  'qiime2': 'anaconda',
  'rapidsai': 'anaconda',
  'rdkit': 'anaconda',
  'stackless': 'anaconda',
  'ursky': 'anaconda',
};
const defaultChannelStatus: Record<string, boolean> = {
  'conda-forge': true,
  'msys2': true,
  'bioconda': true,
  'menpo': true,
  'pytorch': true,
  'pytorch-lts': true,
  'simpleitk': true,
  'nvidia': true,
  'auto': false,
  'biobakery': false,
  'c4aarch64': false,
  'caffe2': false,
  'deepmodeling': false,
  'dglteam': false,
  'fastai': false,
  'fermi': false,
  'idaholab': false,
  'intel': false,
  'matsci': false,
  'MindSpore': false,
  'mordred-descriptor': false,
  'numba': false,
  'ohmeta': false,
  'omnia': false,
  'Paddle': false,
  'peterjc123': false,
  'plotly': false,
  'psi4': false,
  'pytorch3d': false,
  'pyviz': false,
  'qiime2': false,
  'rapidsai': false,
  'rdkit': false,
  'stackless': false,
  'ursky': false,
};
const channelOriginToUrl = (origin: ChannelOrigin) => {
  if (origin === 'anaconda') {
    return 'https://mirrors.zju.edu.cn/anaconda/cloud';
  }
  return 'https://mirrors.zju.edu.cn/anaconda-r';
};

const CondaConfigGen: React.FC<{
  isMiniforge3?: boolean;
}> = ({ isMiniforge3 }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [channelStatus, setChannelStatus] = useState(defaultChannelStatus);

  const onShowCustomChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setShowCustom(e.target.checked);
  };
  const onChannelToggle = (channel: string) => {
    setChannelStatus({
      ...channelStatus,
      [channel]: !channelStatus[channel],
    });
  };

  let conf = isMiniforge3 ? '' : baseConf;
  if (Object.values(channelStatus).some(v => v)) {
    conf += 'custom_channels:\n';
  }
  Object.keys(channelStatus).forEach(channel => {
    if (channelStatus[channel]) {
      conf += `  ${channel}: ${channelOriginToUrl(channelOrigin[channel])}\n`;
    }
  });

  return (
    <Box sx={{ ml: 1 }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox checked={showCustom} onChange={onShowCustomChange} />
          }
          label="自定义使用的软件源"
        />
      </FormGroup>
      <Collapse in={showCustom}>
        <FormGroup sx={{ flexDirection: 'row' }}>
          {!isMiniforge3 && (
            <>
              <FormControlLabel
                control={<Checkbox defaultChecked disabled />}
                label="pkgs/main"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked disabled />}
                label="pkgs/r"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked disabled />}
                label="pkgs/msys2"
              />
            </>
          )}
          {Object.keys(channelStatus).map(channel => {
            return (
              <FormControlLabel
                key={channel}
                control={
                  <Checkbox
                    color={
                      channelOrigin[channel] === 'anaconda'
                        ? 'primary'
                        : 'secondary'
                    }
                    checked={channelStatus[channel]}
                    onChange={() => onChannelToggle(channel)}
                  />
                }
                label={`${channel}`}
              />
            );
          })}
        </FormGroup>
      </Collapse>
      <CodeBlock language="yaml">{conf}</CodeBlock>
    </Box>
  );
};

export { MinicondaInstaller, Miniforge3Installer, CondaConfigGen };
