import React, { useEffect, useState } from "react";
import * as JsSearch from "js-search";
import SearchTable from "../components/search-table";
import Axios from "axios";

export default () => {
  const [mirrors, setMirrors] = useState<Record<string, string>[]>([]);
  const [search, setSearch] = useState<JsSearch.Search>();
  const [searchResults, setSearchResults] = useState<Record<string, string>[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Axios.get("/mirrors/")
      .then(result => {
        const data: any = result.data;
        console.log(result.data);
        setMirrors(data.mirrors);
        rebuildIndex();
      })
      .catch(err => {
        setIsError(true);
        console.log("====================================");
        console.log(`Something bad happened while fetching the data\n${err}`);
        console.log("====================================");
      });
  }, []);

  /**
   * rebuilds the overall index based on the options
   */
  const rebuildIndex = () => {
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
    setSearch(dataToSearch);
    setIsLoading(false);
  };

  /**
   * handles the input change and perform a search with js-search
   * in which the results will be added to the state
   */
  const searchData = e => {
    const queryResult = search.search(e.target.value);
    setSearchQuery(e.target.value);
    setSearchResults(queryResult as Record<string, string>[]);
  };
  const handleSubmit = e => {
    e.preventDefault();
  };
  return (
    <div className="mx-8 my-2">
      <div className="flex justify-center">
        <div className="shadow stats bg-base-200 m-2 ">
          <div className="stat bg-base-200">
            <div className="stat-title">Number of Items</div>
            <div className="stat-value">
              {(searchQuery === "" ? mirrors : searchResults).length}
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="Search" />
              <input
                id="Search"
                value={searchQuery}
                onChange={searchData}
                placeholder="Enter the name of a mirror"
                className="input input-primary input-bordered"
              />
            </form>
          </div>
        </div>
      </div>
      <div>
        <SearchTable
          queryResults={searchQuery === "" ? mirrors : searchResults}
        />
      </div>
    </div>
  );
};
