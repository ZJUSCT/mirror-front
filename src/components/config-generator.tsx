import React, { useState } from "react";

export default ({ promptString, versionList, configGen }: { promptString: string, versionList: string[], configGen: (version: string) => string }) => {
    const [version, setVersion] = useState(versionList[0])
    return (
        <div>{promptString}
            <select id="selectBox" style={{ color: 'black' }} onChange={(event) => { setVersion(event.target.value) }}>
                {
                    versionList.map((item) => {
                        return <option key={item}>{item}</option>
                    })
                }
            </select>
            <pre>{configGen(version)}</pre>
        </div>
    )
}
