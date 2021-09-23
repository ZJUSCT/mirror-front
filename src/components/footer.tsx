import React, { Component } from "react"
import { Link } from "gatsby"

export default () => (
  <footer style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between"}}>
    <div style={{width: "400px"}}>
      <p>
        浙江大学开源镜像站是一个以普及开源软件，方便浙江省内的用户高效访问开源项目的各种资源的非盈利计划。
      </p>
      <p>
        该镜像提供了包括 Arch Linux, CentOS, CPAN, CTAN, Cygwin, Debian, Docker, EPEL, ELPA, Fedora,
        Gentoo, Hackage, Homebrew, Kali Linux, Linux Mint, Manjaro, NeuroDebian, openSUSE, OpenWRT,
        PostgreSQL, Qubes, RFC, Stackage, Ubuntu 等项目源的镜像，以服务于教育和科学研究为目的，提倡自由、平等、协作、共享的精神。
      </p>
    </div>
    <div style={{width: "400px"}}>
      <h3>
        Contact us
      </h3>
      <p>GitHub</p>
      <h3>
        Special Thanks
      </h3>
      <p>
        ZJU QSC
      </p>
      <p>
        ZJU Info Center
      </p>
    </div>
    <div>
      <img src="https://www.zjusct.io/css/images/ZJUSCT_Header_Logo.png" style={{width: "200px", height:"auto"}}/>
    </div>
  </footer>
)
