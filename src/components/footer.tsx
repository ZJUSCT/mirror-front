import React from "react";

export default () => (
  <footer
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
    }}
    className="p-10 footer bg-neutral text-neutral-content"
  >
    <div style={{ width: "400px" }}>
      <p>
        浙江大学开源镜像站是一个以普及开源软件，方便浙江省内的用户高效访问开源项目的各种资源的非盈利计划。
      </p>
      <p>
        本镜像站提供了包括 Docker, PostgreSQL, Ubuntu
        等项目源的镜像，以服务于教育和科学研究为目的，提倡自由、平等、协作、共享的精神。
      </p>
    </div>
    <div>
      <span className="footer-title">About Us</span>
      <a className="link link-hover">E-mail</a>
      <a className="link link-hover">GitHub</a>
      <a className="link link-hover">Blog</a>
    </div>
    <div>
      <span className="footer-title">Special Thanks</span>
      <a className="link link-hover">ZJU QSC</a>
      <a className="link link-hover">ZJU Info Center</a>
      <a className="link link-hover">THU TNUA</a>
    </div>

    <div>
      <img
        src="https://www.zjusct.io/css/images/ZJUSCT_Header_Logo.png"
        style={{ width: "200px", height: "auto" }}
      />
    </div>
  </footer>
);
