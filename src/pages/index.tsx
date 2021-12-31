import React from "react";
import SearchTable from "../components/search-table";
import DataContext from "../context/DataContext";

export default () => {
  return (
    <DataContext.Consumer>
      {data => (
        <div className="mx-6 my-2">
          <div>
            <SearchTable
              queryResults={data.mirrorInfo}
            />
          </div>
        </div>
      )}
    </DataContext.Consumer>
  );
};
