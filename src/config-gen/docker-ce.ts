import {
  GeneratorConfiguration,
  ConfigGenerator,
} from '~/components/config-generator2';

export const debianGenConf: GeneratorConfiguration = {
  distro: {
    type: 'select',
    promptBeforeSelect: '选择你使用的发行版',
    promptOnSelect: '发行版',
    options: ['ubuntu', 'debian'],
    friendlyNames: {
      ubuntu: 'Ubuntu',
      debian: 'Debian',
    },
    defaultValue: 'debian',
  },
  useLocalGpg: {
    type: 'switch',
    friendlyName: '使用镜像站存储的 GPG 公钥（仅推荐在浙江大学校网下使用）',
    defaultValue: true,
  },
};

export const debianGenFunc: ConfigGenerator = genConf => {
  const gpgPathPrefix = genConf.useLocalGpg.value
    ? 'https://mirrors.zju.edu.cn/docker-ce/linux/'
    : 'https://download.docker.com/linux/';
  const distro = genConf.distro.value as string;
  const gpgPath = `${gpgPathPrefix}${distro}/gpg`;

  return {
    language: 'shell',
    content: `#信任 Docker 的 GPG 公钥:
    curl -fsSL ${gpgPath} | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    #添加软件仓库:
    echo \\
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.zju.edu.cn/docker-ce/linux/${distro} \\
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    #最后安装
    sudo apt-get update
    sudo apt-get install docker-ce`,
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
    content: `yum-config-manager --add-repo ${repoFilePrefix}${distro}/docker-ce.repo`,
  };
};
