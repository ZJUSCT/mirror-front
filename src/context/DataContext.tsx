import axios from "axios";
import React, { useState, useEffect } from "react";
import { Data } from "../types/data";
import { MirrorData } from "../types/mirrorz";

const defaultData: Data = {
  mirrorInfo: null,
};

const DataContext = React.createContext(defaultData);

const DataProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<Data>({mirrorInfo: null});
  useEffect(() => {
    axios
      .get<MirrorData>("/api/mirrors")
      .then(result => {
        setData({
          ...data,
          mirrorInfo: result.data.mirrors,
        });
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <DataContext.Provider value={data}>
        {children}
    </DataContext.Provider>
  );
};

export default DataContext;
export { DataProvider };
