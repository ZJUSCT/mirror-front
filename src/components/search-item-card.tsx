import React, { Component } from "react"
import * as styles from "./search-item-card.module.css"
import MirrorIcon from "../../resource/icons/mirror"
import HelpIcon from "../../resource/icons/help"

class SearchItemCard extends Component<{queryItem: any}> {
  generateStatusCircle() {
    const statusString: string = this.props.queryItem.status;
    if (statusString === "") {
      return (
        <div className={styles.circle} style={{background: "gray"}}/>
      );
    } else if (statusString[0] === "S") {
      return (
        <div className={styles.circle} style={{background: "green"}}/>
      )
    } else if (statusString[0] === "Y") {
      return (
        <div className={styles.circle} style={{background: "orange"}}/>
      )
    } else if (statusString[0] === "F") {
      return (
        <div className={styles.circle} style={{background: "red"}}/>
      )
    } else if (statusString[0] === "P") {
      return (
        <div className={styles.circle} style={{background: "lightblue"}}/>
      )
    } else {
      return (
        <div className={styles.circle} style={{background: "gray"}}/>
      );
    }
  }

  render() {
    const statusHTML = this.generateStatusCircle();
    return (
      <div className={styles.box}>
        <div className={styles.content}>
          <div>
            <div className={styles.titleLine}>
              <div className={styles.titleLineLeft}>
                <MirrorIcon size={"20"} />
                <a href={this.props.queryItem.url} className={styles.a}>{this.props.queryItem.cname}</a>
              </div>
              <a href={this.props.queryItem.help}>
                <HelpIcon size={"24"} />
              </a>
            </div>
            <div className={styles.description}>
              {this.props.queryItem.desc}
            </div>
          </div>
          {statusHTML}
        </div>
      </div>
    )
  }
}

export default SearchItemCard
