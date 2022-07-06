import React from "react";
import { Icon } from '@iconify/react';
import ubuntuIcon from '@iconify/icons-logos/ubuntu';
import npmIcon from '@iconify/icons-logos/npm-icon';
import pythonIcon from '@iconify/icons-logos/python';
import archlinuxIcon from '@iconify/icons-logos/archlinux';
import centosIcon from '@iconify/icons-logos/centos-icon';
import debianIcon from '@iconify/icons-logos/debian';

export default [
  {
    id: 'ubuntu',
    icon: <Icon height="4rem" icon={ubuntuIcon} />
  },
  {
    id: 'npm',
    icon: <Icon height="4rem" icon={npmIcon} />
  },
  {
    id: 'pypi',
    icon: <Icon height="4rem" icon={pythonIcon} />
  },
  {
    id: 'debian',
    icon: <Icon height="4rem" icon={debianIcon} />
  },
  {
    id: 'archlinux',
    icon: <Icon height="4rem" icon={archlinuxIcon} />
  },
  {
    id: 'centos',
    icon: <Icon height="4rem" icon={centosIcon} />
  },
];
