import React from "react";
import SearchItemCard from "../components/search-item-card";

export default (props: { queryResults: Record<string, string>[] }) => {
  console.log(props.queryResults);
  return <div className="flex justify-center">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {props.queryResults.map(item => (
        <SearchItemCard queryItem={item} />
      ))}
    </div>
  </div>
};
