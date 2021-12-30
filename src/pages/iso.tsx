import React from "react";
import DataContext from "../context/DataContext";

export default () => {
  return (
    <DataContext.Consumer>
      {data => (
        <div className="mx-8 my-2">
          <div>
              {JSON.stringify(data.releaseInfo)}
          </div>
        </div>
      )}
    </DataContext.Consumer>
  );
};
