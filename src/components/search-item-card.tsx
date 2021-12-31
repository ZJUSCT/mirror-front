import * as React from "react";
import type { Mirror } from "../types/mirrorz";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    var statusCircle: React.ReactNode;
    switch (statusString[0]) {
      case "S":
        statusCircle =  <div className="badge badge-success">success</div>;
        break;
      case "Y":
        statusCircle = <div className="badge badge-info">syncing</div>;
        break;
      case "F":
        statusCircle = <div className="badge badge-error">failed</div>;
        break;
      case "P":
        statusCircle = <div className="badge badge-info">paused</div>;
        break;
      case "C":
        statusCircle = <div className="badge badge-info">cached</div>;
        break;
      default:
        statusCircle = <div className="badge badge-warning">unknown</div>;
    }
    // console.log(statusString.substring(1, 11));
    var timeString: string = statusString.substring(1, 11);
    if (timeString.length !== 0) {
      var timeString = new Date(parseInt(timeString) * 1000).toLocaleString("zh-CN");
      return (
        <div data-tip={timeString} className="tooltip tooltip-right tooltip-secondary">
          {statusCircle}
        </div>
      );
    } else {
      return statusCircle;
    }
    
  };

  return (
    <div className="m-2 rounded-sm shadow-md border-sm card bg-base-200">
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
