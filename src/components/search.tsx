import React, { Component } from "react"
import * as JsSearch from "js-search"
import SearchTable from "./search-table"
import Axios from "axios"

class Search extends Component {

  state: any = {
    mirrors: [],
    search: [],
    searchResults: [],
    isLoading: true,
    isError: false,
    searchQuery: ""
  }

  /**
   * React lifecycle method to fetch the data
   */
  async componentDidMount() {
    Axios.get('/Mirrors/')
      .then(result => {
        const data: any = result.data;
        this.setState({ mirrors: data.mirrors });
        this.rebuildIndex();
      }).catch (err => {
      this.setState({ isError: true });
      console.log("====================================");
      console.log(`Something bad happened while fetching the data\n${err}`);
      console.log("====================================");
    });
  }

  /**
   * rebuilds the overall index based on the options
   */
  rebuildIndex = () => {
    const { mirrors } = this.state;
    const dataToSearch = new JsSearch.Search("cname");
    /**
     *  defines a indexing strategy for the data
     * more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy();
    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer();
    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex("cname");

    dataToSearch.addIndex("cname"); // sets the index attribute for the data

    dataToSearch.addDocuments(mirrors); // adds the data to be searched
    this.setState({ search: dataToSearch, isLoading: false });
  }

  /**
   * handles the input change and perform a search with js-search
   * in which the results will be added to the state
   */
  searchData: React.ChangeEventHandler<HTMLInputElement> = e => {
    const { search } = this.state;
    const queryResult = search.search(e.target.value);
    this.setState({ searchQuery: e.target.value, searchResults: queryResult });
  }
  handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
  }

  render() {
    const { mirrors, searchResults, searchQuery } = this.state;
    const queryResults: Record<string, string>[] = searchQuery === "" ? mirrors : searchResults;
    // @ts-ignore
    // @ts-ignore
    return (
      <div className="mx-8 my-2">
        <div className="flex justify-center">
          <div className="shadow stats bg-base-200 m-2 ">
            <div className="stat bg-base-200">
              <div className="stat-title">Number of Items</div>
              <div className="stat-value">{queryResults.length}</div>
              <form onSubmit={this.handleSubmit}>
                <label htmlFor="Search" />
                <input
                  id="Search"
                  value={searchQuery}
                  onChange={this.searchData}
                  placeholder="Enter the name of a mirror"
                  className="input input-primary input-bordered"
                />
              </form>
            </div>
          </div>
        </div>
        <div>
          <SearchTable queryResults={queryResults} />
        </div>
      </div>
    )
  }
}

export default Search