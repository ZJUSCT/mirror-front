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
        浙江大学开源软件镜像站是一个以普及开源软件，方便校内外用户高效访问开源项目的各种资源的非盈利计划。
      </p>
      <p>
        本镜像站提供了包括 Docker, PostgreSQL, Ubuntu
        等项目源的镜像，以服务于教育和科学研究为目的，提倡自由、平等、协作、共享的精神。
      </p>
    </div>
    <div>
      <span className="footer-title">关于我们</span>
      <a className="link link-hover" href="mailto:mail@zjusct.io">
        Email
      </a>
      <a className="link link-hover" href="https://github.com/zjusct">
        GitHub
      </a>
      <a className="link link-hover" href="https://www.zjusct.io">
        Blog
      </a>
    </div>
    <div>
      <span className="footer-title">特别鸣谢</span>
      <a className="link link-hover" href="http://zuits.zju.edu.cn">
        浙江大学信息技术中心
      </a>
      <a className="link link-hover" href="https://tuna.moe">
        清华大学 TUNA 协会
      </a>
      <a className="link link-hover" href="https://lug.ustc.edu.cn">
        中国科学技术大学 Linux 用户协会
      </a>
    </div>

    <div>
      <img
        src="https://www.zjusct.io/css/images/ZJUSCT_Header_Logo.png"
        style={{ width: "200px", height: "auto" }}
      />
    </div>
  </footer>
);
