import React, { Component, ReactNode } from "react"
import * as styles from "./search-table.module.css"
import { Link } from "gatsby"
import SearchItemCard from "../components/search-item-card"

export default (props: { queryResults: Record<string, string>[] }) => (
  <div style={{ margin: "0 auto"}}>
    <div className={styles.grid}>
    {
      props.queryResults.map(item => (
        <SearchItemCard queryItem={item}/>
      ))
    }
    </div>

  </div>
)