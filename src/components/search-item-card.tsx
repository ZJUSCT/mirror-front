import React, { Component } from "react";

class SearchItemCard extends Component<{queryItem: any}> {
  generateStatusCircle() {
    const statusString: string = this.props.queryItem.status;
    if (statusString === "") {
      return (
        <div className="badge badge-ghost">success</div>
      );
    } else if (statusString[0] === "S") {
      return (
        <div className="badge badge-success">success</div>
      )
    } else if (statusString[0] === "Y") {
      return (
        <div className="badge badge-warning">syncing</div>
      )
    } else if (statusString[0] === "F") {
      return (
        <div className="badge badge-error">failed</div>
      )
    } else if (statusString[0] === "P") {
      return (
        <div className="badge badge-warning">paused</div>
      )
    } else {
      return (
        <div className="badge badge-warning">unknown</div>
      );
    }
  }

  render() {
    const statusHTML = this.generateStatusCircle();
    return (
      <div className="card shadow-2xl bg-base-200 m-2">
        <div className="card-body flex-col justify-between">
          <div>
            <div className="card-title flex justify-between items-center">
              <div className="flex items-center">
                <a href={this.props.queryItem.url} className="link link-primary link-hover">{this.props.queryItem.cname}</a>
              </div>
              <div>
                <a href={this.props.queryItem.help} className="flex content-center">
                  <div className="badge badge-accent badge-outline">help</div>
                </a>
              </div>
            </div>
            <div className="mb-3">
              {this.props.queryItem.desc}
            </div>
          </div>
          <div>
            {statusHTML}
          </div>
        </div>
      </div>
    );
  }
}

export default SearchItemCard;
