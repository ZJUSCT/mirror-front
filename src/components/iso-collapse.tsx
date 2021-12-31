import * as React from "react";
import type { Info } from "../types/mirrorz";

export default ({ isoInfo }: { isoInfo: Info }) => {
    return (
        <div className="m-2 rounded-sm shadow-md border-sm collapse border-base-300 collapse-arrow">
            <input type="checkbox" />
            <div className="text-xl font-medium collapse-title">
                {isoInfo.distro}
            </div>
            <div className="collapse-content">
                {isoInfo.urls.map((item, i) => {
                    return (
                        <p key={i}>
                            <a href={item.url} className="link link-primary">{item.name}</a>
                        </p>
                    )
                })}
            </div>
        </div>
    );
};
