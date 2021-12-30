import React, { useEffect, useState } from "react";
import * as JsSearch from "js-search";
import SearchTable from "../components/search-table";
import axios from "axios";
import type { Mirror, Mirrorz } from "../types/mirrorz";

export default () => {
  const [search, setSearch] = useState<JsSearch.Search>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mirrors, setMirrors] = useState<Mirror[]>([]);
  const [searchResults, setSearchResults] = useState<Mirror[]>(
    []
  );

  useEffect(() => {
    axios.get<Mirrorz>("/api/mirrors/")
      .then(result => {
        setMirrors(result.data.mirrors);
      })
      .catch(err => {
        setIsError(true);
        console.log("====================================");
        console.log(`Something bad happened while fetching the data\n${err}`);
        console.log("====================================");
      });
  }, []);

  return (
    <div className="mx-8 my-2">
      <div>
        <SearchTable
          queryResults={mirrors}
        />
      </div>
    </div>
  );
};
