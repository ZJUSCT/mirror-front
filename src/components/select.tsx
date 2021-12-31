import React from "react";
import type {VersionData} from "../types/mirrorz";

const changeOption = () => {

}

// Remain types to be added
export default ({verData}: {verData: VersionData}) => {
    return (
    <div>
        <select style={{color:"black"}} onChange={changeOption}>
        {
        verData.versionName.map((item, index) => {
            return <option key={index}>{item}</option>
        })
        }
        </select>
    </div>
    )
}


