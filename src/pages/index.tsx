import React from "react"
import Search from "../components/search"
import Footer from "../components/footer"

const IndexPage = () => (
  <div style={{minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
    <div>
      <h1>
        ZJU Mirror
      </h1>
      <div>
        <Search />
      </div>
    </div>
    <Footer />
  </div>
)

export default IndexPage