import React from "react";
import SearchTable from "../components/search-table";
import { fetchMirrorData } from "../utils/DataSource";

export default ({ serverData }) => (
  <div className="mx-6 my-2">
    <div>
      <SearchTable queryResults={serverData.mirrorInfo} />
    </div>
  </div>
);

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
