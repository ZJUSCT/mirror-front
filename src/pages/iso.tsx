import React from "react";
import ISOCollapse from "../components/iso-collapse";
import DataContext from "../context/DataContext";

export default () => {
    return (
        <DataContext.Consumer>
            {data => (
                <div className="mx-8 my-2 mt-6 mb-6">
                    {data.releaseInfo?.map(item => {
                        return <ISOCollapse isoInfo={item}/>
                    })}
                </div>
            )}
        </DataContext.Consumer>
    );
};
