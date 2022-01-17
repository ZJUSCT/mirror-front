import React from "react";
import ISOCollapse from "../components/iso-collapse";
import { fetchMirrorData } from "../utils/DataSource";

export default ({ serverData }) => (
  <div className="mx-8 my-2 mt-6 mb-6">
    {serverData.releaseInfo?.map((item, i) => {
      return <ISOCollapse isoInfo={item} key={i} />;
    })}
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
