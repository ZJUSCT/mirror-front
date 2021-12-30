import React from "react";
import type { Mirror } from "../types/mirrorz";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    switch (statusString[0]) {
      case "S":
        return <div className="badge badge-success">success</div>;
      case "Y":
        return <div className="badge badge-info">syncing</div>;
      case "F":
        return <div className="badge badge-error">failed</div>;
      case "P":
        return <div className="badge badge-info">paused</div>;
      case "C":
        return <div className="badge badge-info">cached</div>;
      default:
        return <div className="badge badge-warning">unknown</div>;
    }
  };

  return (
    <div className="m-2 shadow-md card bg-base-200">
      <div className="flex-col justify-between card-body">
        <div>
          <div className="flex items-center justify-between card-title">
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
        <div className="">
          <div>{generateStatusCircle()}</div>
        </div>
      </div>
    </div>
  );
};
