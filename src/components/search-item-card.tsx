import React, { Component } from "react"
import * as styles from "./search-item-card.module.css"
import MirrorIcon from "../../resource/icons/mirror"
import HelpIcon from "../../resource/icons/help"

export default (props: { queryItem: any }) => (
  <div className={styles.box}>
    <div className={styles.content}>
      <div className={styles.titleLine}>
        <div className={styles.titleLineLeft}>
          <MirrorIcon size={"20"}/>
          <a href={props.queryItem.url} className={styles.a}>{props.queryItem.cname}</a>
        </div>
        <a href={props.queryItem.help}>
          <HelpIcon size={"24"}/>
        </a>

      </div>
      <div className={styles.description}>
        {props.queryItem.desc}
      </div>
    </div>
  </div>
)
