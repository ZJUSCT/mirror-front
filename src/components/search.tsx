import React, { Component } from "react"
import JSONData from "../../resource/mirrorz-demo.json"
import * as JsSearch from "js-search"
import { Link } from "gatsby"
import * as styles from "./search.module.css"

class Search extends Component {
  state: any = {
    mirrors: JSONData.mirrors,
    search: [],
    searchResults: [],
    isLoading: true,
    isError: false,
    searchQuery: "",
  }
  /**
   * React lifecycle method to fetch the data
   */
  async componentDidMount() {
    try {
      this.rebuildIndex()
    } catch(err) {
      this.setState({ isError: true })
      console.log("====================================")
      console.log(`Something bad happened while fetching the data\n${err}`)
      console.log("====================================")
    }
  }

  /**
   * rebuilds the overall index based on the options
   */
  rebuildIndex = () => {
    const { mirrors } = this.state
    const dataToSearch = new JsSearch.Search("cname")
    /**
     *  defines a indexing strategy for the data
     * more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()
    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer()
    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex("cname")

    dataToSearch.addIndex("cname") // sets the index attribute for the data

    dataToSearch.addDocuments(mirrors) // adds the data to be searched
    this.setState({ search: dataToSearch, isLoading: false })
  }

  /**
   * handles the input change and perform a search with js-search
   * in which the results will be added to the state
   */
  searchData: React.ChangeEventHandler<HTMLInputElement> = e => {
    const { search } = this.state
    const queryResult = search.search(e.target.value)
    this.setState({ searchQuery: e.target.value, searchResults: queryResult })
  }
  handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
  }

  render() {
    const { mirrors, searchResults, searchQuery } = this.state
    const queryResults: Record<string, string>[] = searchQuery === "" ? mirrors : searchResults
    return (
      <div>
        <div style={{ margin: "0 auto" }}>
          <form onSubmit={this.handleSubmit}>
            <div style={{ margin: "0 auto" }}>
              <label htmlFor="Search" style={{ paddingRight: "10px" }}>
                Enter your search here
              </label>
              <input
                id="Search"
                value={searchQuery}
                onChange={this.searchData}
                placeholder="Enter your search here"
                style={{ margin: "0 auto", width: "400px" }}
              />
            </div>
          </form>
          <div>
            Number of items:
            {queryResults.length}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                borderRadius: "4px",
                border: "1px solid #d3d3d3",
              }}
            >
              <thead style={{ border: "1px solid #808080" }}>
              <tr>
                <th className={styles.th}>
                  Name
                </th>
                <th className={styles.th}>
                  Description
                </th>
                <th className={styles.th}>
                  Help
                </th>
              </tr>
              </thead>
              <tbody>
              {queryResults.map(item => {
                return (
                  <tr key={`row_${item.cname}`}>
                    <td className={styles.td}>
                      <a href={item.url}>{item.cname}</a>
                    </td>
                    <td className={styles.td}>
                      {item.desc}
                    </td>
                    <td className={styles.td}>
                      <Link to={item.help}>help</Link>
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}
export default Search