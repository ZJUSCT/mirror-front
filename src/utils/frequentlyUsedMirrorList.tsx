import React from "react";
import Ubuntu from "../../resource/icons/ubuntu.svg";
import Npm from "../../resource/icons/npm.svg";
import Python from "../../resource/icons/python.svg";
import ArchLinux from "../../resource/icons/archlinux.svg";
import CentOS from "../../resource/icons/centos.svg";
import Docker from "../../resource/icons/docker.svg";
import type { mirrorBrief } from "../components/frequently-used-mirror-card";

const frequentlyUsedMirror: mirrorBrief[] = [
  {
    name: "Ubuntu",
    img: <Ubuntu width="4rem" fill="#E95420" />,
    desc: "Ubuntu 软件包",
  },
  {
    name: "NPM",
    img: <Npm width="4rem" fill="#CB3837" />,
    desc: "Node.JS 程序库",
  },
  {
    name: "PyPI",
    img: <Python width="4rem" fill="#3776AB" />,
    desc: "Python PIP 程序库",
  },
  {
    name: "Arch Linux",
    img: <ArchLinux width="4rem" fill="#1793D1" />,
    desc: "Arch Linux 软件包",
  },
  {
    name: "CentOS",
    img: <CentOS width="4rem" fill="#262577" />,
    desc: "CentOS 软件包",
  },
  {
    name: "Docker",
    img: <Docker width="4rem" fill="#2496ED" />,
    desc: "Docker 应用镜像",
  },
];

export { frequentlyUsedMirror };
