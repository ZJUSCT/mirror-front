import React from 'react';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import alpineLinuxIcon from '@iconify/icons-simple-icons/alpinelinux';
import anacondaIcon from '@iconify/icons-simple-icons/anaconda';
import archLinuxIcon from '@iconify/icons-simple-icons/archlinux';
import centOsIcon from '@iconify/icons-simple-icons/centos';
import debianIcon from '@iconify/icons-simple-icons/debian';
import deepinIcon from '@iconify/icons-simple-icons/deepin';
import dockerIcon from '@iconify/icons-simple-icons/docker';
import fedoraIcon from '@iconify/icons-simple-icons/fedora';
import gentooIcon from '@iconify/icons-simple-icons/gentoo';
import gnuIcon from '@iconify/icons-simple-icons/gnu';
import gnuEmacsIcon from '@iconify/icons-simple-icons/gnuemacs';
import homebrewIcon from '@iconify/icons-simple-icons/homebrew';
import kaliIcon from '@iconify/icons-simple-icons/kalilinux';
import manjaroIcon from '@iconify/icons-simple-icons/manjaro';
import npmIcon from '@iconify/icons-simple-icons/npm';
import openWrtIcon from '@iconify/icons-simple-icons/openwrt';
import pythonIcon from '@iconify/icons-simple-icons/python';
import raspberryPiIcon from '@iconify/icons-simple-icons/raspberrypi';
import rockyIcon from '@iconify/icons-simple-icons/rockylinux';
import rosIcon from '@iconify/icons-simple-icons/ros';
import ubuntuIcon from '@iconify/icons-simple-icons/ubuntu';

export default function TitleMirrorIcon(
  mirrorName: string,
  color: string,
  size: string
) {
  switch (mirrorName) {
    case 'alpine':
      return <Icon height={size} icon={alpineLinuxIcon} color={color} />;
    case 'anaconda':
      return <Icon height={size} icon={anacondaIcon} color={color} />;
    case 'archlinux':
      return <Icon height={size} icon={archLinuxIcon} color={color} />;
    case 'centos':
      return <Icon height={size} icon={centOsIcon} color={color} />;
    case 'centos-vault':
      return <Icon height={size} icon={centOsIcon} color={color} />;
    case 'debian':
      return <Icon height={size} icon={debianIcon} color={color} />;
    case 'deepin':
      return <Icon height={size} icon={deepinIcon} color={color} />;
    case 'docker-ce':
      return <Icon height={size} icon={dockerIcon} color={color} />;
    case 'elpa':
      return <Icon height={size} icon={gnuEmacsIcon} color={color} />;
    case 'fedora':
      return <Icon height={size} icon={fedoraIcon} color={color} />;
    case 'gentoo':
      return <Icon height={size} icon={gentooIcon} color={color} />;
    case 'gentoo-portage':
      return <Icon height={size} icon={gentooIcon} color={color} />;
    case 'gentoo-portage.git':
      return <Icon height={size} icon={gentooIcon} color={color} />;
    case 'gnu':
      return <Icon height={size} icon={gnuIcon} color={color} />;
    case 'homebrew':
      return <Icon height={size} icon={homebrewIcon} color={color} />;
    case 'kali':
      return <Icon height={size} icon={kaliIcon} color={color} />;
    case 'manjaro':
      return <Icon height={size} icon={manjaroIcon} color={color} />;
    case 'npm':
      return <Icon height={size} icon={npmIcon} color={color} />;
    case 'openwrt':
      return <Icon height={size} icon={openWrtIcon} color={color} />;
    case 'pypi':
      return <Icon height={size} icon={pythonIcon} color={color} />;
    case 'raspbian':
      return <Icon height={size} icon={raspberryPiIcon} color={color} />;
    case 'rocky':
      return <Icon height={size} icon={rockyIcon} color={color} />;
    case 'ros':
      return <Icon height={size} icon={rosIcon} color={color} />;
    case 'ros2':
      return <Icon height={size} icon={rosIcon} color={color} />;
    case 'rosdistro':
      return <Icon height={size} icon={rosIcon} color={color} />;
    case 'ubuntu':
      return <Icon height={size} icon={ubuntuIcon} color={color} />;
    case 'ubuntu-ports':
      return <Icon height={size} icon={ubuntuIcon} color={color} />;
    default:
      return <Box />;
  }
}
