import React from "react"
import Menu from "../components/menu"
import Search from "../components/search"
import Footer from "../components/footer"

const IndexPage = () => (
  <div style={{minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
    <div>
      <Menu />
      <div>
        <Search />
      </div>
    </div>
    <Footer />
  </div>
)

export default IndexPage