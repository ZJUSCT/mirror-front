import React from "react";
import type { Mirror } from "../types/mirrorz";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    if (statusString === "") {
      return <div className="badge badge-ghost">success</div>;
    } else if (statusString[0] === "S") {
      return <div className="badge badge-success">success</div>;
    } else if (statusString[0] === "Y") {
      return <div className="badge badge-warning">syncing</div>;
    } else if (statusString[0] === "F") {
      return <div className="badge badge-error">failed</div>;
    } else if (statusString[0] === "P") {
      return <div className="badge badge-warning">paused</div>;
    } else {
      return <div className="badge badge-warning">unknown</div>;
    }
  };

  return (
    <div className="card shadow-2xl bg-base-200 m-2">
      <div className="card-body flex-col justify-between">
        <div>
          <div className="card-title flex justify-between items-center">
            <div className="flex items-center">
              <a
                href={props.queryItem.url}
                className="link link-primary link-hover"
              >
                {props.queryItem.cname}
              </a>
            </div>
            {props.queryItem.help === undefined ? (
              <></>
            ) : (
              <div>
                <a href={props.queryItem.help} className="flex content-center">
                  <div className="badge badge-accent badge-outline">help</div>
                </a>
              </div>
            )}
          </div>
          <div className="mb-3">{props.queryItem.desc}</div>
        </div>
        <div>{generateStatusCircle()}</div>
      </div>
    </div>
  );
};
