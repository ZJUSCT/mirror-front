import React, { Component } from "react"
import JSONData from "../../resource/mirrorz-demo.json"
import * as JsSearch from "js-search"
import SearchTable from "./search-table"
import MirrorIcon from "../../resource/icons/mirror.svg"

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
    // @ts-ignore
    // @ts-ignore
    return (
      <div>
        <div style={{ margin: "0 auto" }}>
          <form onSubmit={this.handleSubmit}>
            <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between"}}>
              <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}>
                <MirrorIcon />
                <label htmlFor="Search" style={{ paddingRight: "10px" }}>
                  Image list
                </label>
              </div>
              <input
                id="Search"
                value={searchQuery}
                onChange={this.searchData}
                placeholder="Enter your image name here"
                style={{ width: "400px" }}
              />
            </div>
          </form>
          <div>
            Number of items:
            {queryResults.length}
            <SearchTable queryResults={queryResults}/>
          </div>
        </div>
      </div>
    )
  }
}
export default Search