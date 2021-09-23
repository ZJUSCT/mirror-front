import React, { Component, ReactNode } from "react"
import * as styles from "./search-table.module.css"
import { Link } from "gatsby"

export default (props: { queryResults: Record<string, string>[] }) => (
  <div style={{ margin: "0 auto"}}>
    <div className={styles.outerFlex}>
      <div style={{ flex: 1 }}>
        Name
      </div>
      <div style={{ flex: 5 }}>
        Description
      </div>
      <div style={{ flex: 1 }}>
        Help
      </div>
    </div>

    {
      props.queryResults.map(item => (
        <div className={styles.outerFlex}>
          <div style={{ flex: 1 }}>
            <a href={item.url}>{item.cname}</a>
          </div>
          <div style={{ flex: 5 }}>
            {item.desc}
          </div>
          <div style={{ flex: 1 }}>
            <Link to={item.help}>help</Link>
          </div>
        </div>
      ))
    }

  </div>
)