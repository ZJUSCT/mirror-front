import React from "react";
import SearchTable from "../components/search-table";
import DataContext from "../context/DataContext";

export default () => {
  return (
    <DataContext.Consumer>
      {data => (
        <div className="mx-6 my-2">
          <div>
            <div className="mx-2 mt-4 mb-2 rounded-sm alert alert-info">
              <div className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <label>浙江大学开源软件镜像站试运行中...</label>
              </div>
            </div>
            <SearchTable
              queryResults={data.mirrorInfo}
            />
          </div>
        </div>
      )}
    </DataContext.Consumer>
  );
};
