import {
  GeneratorConfiguration,
  ConfigGenerator,
} from '~/components/config-generator2';

export const conf: GeneratorConfiguration = {
  distro: {
    type: 'select',
    promptBeforeSelect: '',
    promptOnSelect: '系统版本',
    options: ['el8', 'el9'],
    friendlyNames: {
      el8: 'EL 8 (CentOS/RHEL/AlmaLinux/Rocky)',
      el9: 'EL 9 (CentOS/RHEL/AlmaLinux/Rocky)',
    },
    defaultValue: 'el8',
  },
};

export const gen: ConfigGenerator = genConf => {
  const distro = genConf.distro.value as string;
  const v = distro === 'el8' ? '8' : '9';

  return {
    language: 'shell',
    content: `yum install https://www.elrepo.org/elrepo-release-${v}.el${v}.elrepo.noarch.rpm`,
  };
};
