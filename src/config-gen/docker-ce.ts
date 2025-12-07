import {
  GeneratorConfiguration,
  ConfigGenerator,
} from '~/components/config-generator2';

export const debianGenConf: GeneratorConfiguration = {
  distro: {
    type: 'select',
    promptBeforeSelect: '请选择你使用的发行版',
    promptOnSelect: '发行版',
    options: ['ubuntu', 'debian'],
    friendlyNames: {
      ubuntu: 'Ubuntu',
      debian: 'Debian',
    },
    defaultValue: 'ubuntu',
  },
  useLocalGpg: {
    type: 'switch',
    friendlyName: '使用镜像站存储的 GPG 公钥（仅推荐在浙江大学校网下使用）',
    defaultValue: true,
  },
  useDeb822: {
    type: 'switch',
    friendlyName: '使用 DEB822 格式（适用于较新的 APT 版本）',
    defaultValue: true,
  },
};

export const debianGenFunc: ConfigGenerator = genConf => {
  const gpgPathPrefix = genConf.useLocalGpg.value
    ? 'https://mirrors.zju.edu.cn/docker-ce/linux/'
    : 'https://download.docker.com/linux/';
  const distro = genConf.distro.value as string;
  const gpgPath = `${gpgPathPrefix}${distro}/gpg`;
  const useDeb822 = (genConf.useDeb822?.value as boolean | undefined) ?? true;
  const keyringPath = useDeb822
    ? '/etc/apt/keyrings/docker.asc'
    : '/etc/apt/keyrings/docker.gpg';
  const gpgCommand = useDeb822
    ? `sudo curl -fsSL ${gpgPath} -o ${keyringPath}`
    : `curl -fsSL ${gpgPath} | sudo gpg --dearmor -o ${keyringPath}`;
  const repoCommand = useDeb822
    ? `sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://mirrors.zju.edu.cn/docker-ce/linux/${distro}
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: ${keyringPath}
EOF`
    : `echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=${keyringPath}] https://mirrors.zju.edu.cn/docker-ce/linux/${distro} \\
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`;

  return {
    language: 'shell',
    content: `#信任 Docker 的 GPG 公钥:
${gpgCommand}

#添加软件仓库:
${repoCommand}
`,
  };
};

export const elGenConf: GeneratorConfiguration = {
  distro: {
    type: 'select',
    promptBeforeSelect: '选择你使用的发行版',
    promptOnSelect: '发行版',
    options: ['centos', 'fedora'],
    friendlyNames: {
      centos: 'CentOS/RHEL/Rocky/AlmaLinux',
      fedora: 'Fedora',
    },
    defaultValue: 'centos',
  },
  useLocalRepoFile: {
    type: 'switch',
    friendlyName: '使用镜像站存储的 repo 文件（仅推荐在浙江大学校网下使用）',
    defaultValue: true,
  },
};

export const elGenFunc: ConfigGenerator = genConf => {
  const repoFilePrefix = genConf.useLocalRepoFile.value
    ? 'https://mirrors.zju.edu.cn/docker-ce/linux/'
    : 'https://download.docker.com/linux/';
  const distro = genConf.distro.value as string;
  return {
    language: 'shell',
    content: `sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo ${repoFilePrefix}${distro}/docker-ce.repo`,
  };
};
