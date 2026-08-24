export interface LocalizedText {
  zh: string;
  en: string;
}

export interface LegacyGuideRoute {
  title: LocalizedText;
  description: LocalizedText;
  action?: {
    href: string;
    label: LocalizedText;
  };
}

export const legacyGuideRoutes: Record<string, LegacyGuideRoute> = {
  'crates.io-index.git': {
    title: {
      zh: 'crates.io Git 索引（已退役）',
      en: 'crates.io Git index (retired)',
    },
    description: {
      zh: '本站已停止提供旧的 Git 索引。新版 Cargo 请使用稀疏索引；旧页面中的 Git 配置不再有效。',
      en: 'ZJU Mirror no longer provides the old Git index. Use the sparse index with a current Cargo release; the Git configuration from the old guide is no longer valid.',
    },
    action: {
      href: '/docs/crates.io-index/',
      label: {
        zh: '查看稀疏索引帮助',
        en: 'Open the sparse-index guide',
      },
    },
  },
  'gentoo-portage.git': {
    title: {
      zh: 'Gentoo Portage Git（已退役）',
      en: 'Gentoo Portage Git (retired)',
    },
    description: {
      zh: '本站已停止提供 Portage Git 镜像。旧页面中的 Git 同步命令不再有效；当前帮助介绍了仍在目录中的 rsync 镜像。',
      en: 'ZJU Mirror no longer provides the Portage Git mirror. The Git synchronization commands from the old page are no longer valid; the current guide covers the rsync mirror that remains in the catalog.',
    },
    action: {
      href: '/docs/gentoo-portage/',
      label: {
        zh: '查看 Gentoo Portage 帮助',
        en: 'Open the Gentoo Portage guide',
      },
    },
  },
  'homebrew.git': {
    title: {
      zh: 'Homebrew 旧帮助地址',
      en: 'Legacy Homebrew guide URL',
    },
    description: {
      zh: '该旧帮助地址已合并到当前的 Homebrew 帮助。请使用新页面中经审核的配置，不要继续使用旧页面中的仓库列表。',
      en: 'This old help URL has been consolidated into the current Homebrew guide. Use the reviewed configuration on the new page instead of the repository list from the former guide.',
    },
    action: {
      href: '/docs/homebrew/',
      label: {
        zh: '查看 Homebrew 帮助',
        en: 'Open the Homebrew guide',
      },
    },
  },
  'glibc.git': {
    title: { zh: 'glibc Git 镜像（已移除）', en: 'glibc Git mirror (removed)' },
    description: {
      zh: '该镜像已不在当前镜像目录中，原数据地址也已停止服务。为避免误导，本页不再显示旧的克隆命令。',
      en: 'This mirror is no longer present in the current catalog, and its former data endpoint is no longer served. The old clone command has been withdrawn to avoid misleading users.',
    },
  },
  'linux.git': {
    title: {
      zh: 'Linux Git 镜像（已移除）',
      en: 'Linux Git mirror (removed)',
    },
    description: {
      zh: '该镜像已不在当前镜像目录中，原数据地址也已停止服务。为避免误导，本页不再显示旧的克隆命令。',
      en: 'This mirror is no longer present in the current catalog, and its former data endpoint is no longer served. The old clone commands have been withdrawn to avoid misleading users.',
    },
  },
  ius: {
    title: { zh: 'IUS 镜像（已移除）', en: 'IUS mirror (removed)' },
    description: {
      zh: 'IUS 镜像已按公告完成移除，也不在当前镜像目录中。旧页面中的软件源配置不再有效。',
      en: 'The IUS mirror was removed according to the published retirement notice and is no longer in the current catalog. Repository configuration from the old page is no longer valid.',
    },
    action: {
      href: '/news/240605_removal_of_ius/',
      label: {
        zh: '查看移除公告',
        en: 'Read the removal notice (Chinese)',
      },
    },
  },
  npm: {
    title: { zh: 'NPM 旧帮助', en: 'Legacy NPM guide' },
    description: {
      zh: '该服务不在当前镜像目录中，也没有经审核的共享帮助。新前端不再发布旧的 NPM 和 Yarn 配置命令；请先确认该兼容端点的所有者和服务周期。',
      en: 'This service is outside the current catalog and has no reviewed shared guide. The new frontend does not republish the old NPM or Yarn commands; confirm ownership and lifecycle of the compatibility endpoint before relying on it.',
    },
  },
};
