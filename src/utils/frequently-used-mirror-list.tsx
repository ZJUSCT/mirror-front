import React from "react";
import { Icon } from '@iconify/react';
import ubuntuIcon from '@iconify/icons-logos/ubuntu';
import npmIcon from '@iconify/icons-logos/npm-icon';
import pythonIcon from '@iconify/icons-logos/python';
import archlinuxIcon from '@iconify/icons-logos/archlinux';
import centosIcon from '@iconify/icons-logos/centos-icon';
import dockerIcon from '@iconify/icons-logos/docker-icon';


export default [
  {
    id: 'ubuntu',
    icon: <Icon width="4rem" icon={ubuntuIcon} />
  },
  {
    id: 'npm',
    icon: <Icon width="4rem" icon={npmIcon} />
  },
  {
    id: 'python',
    icon: <Icon width="4rem" icon={pythonIcon} />
  },
  {
    id: 'archlinux',
    icon: <Icon width="4rem" icon={archlinuxIcon} />
  },
  {
    id: 'centos',
    icon: <Icon width="4rem" icon={centosIcon} />
  },
  {
    id: 'docker',
    icon: <Icon width="4rem" icon={dockerIcon} />
  },
];
