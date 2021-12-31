import React from "react";

export default () => (
  <div className="h-64 pb-8 mb-2 navbar bg-neutral text-neutral-content">
    <div className="flex-1 h-full px-2 mx-2">
      <div className="flex flex-col flex-1 h-full">
        <div className="flex-1 grow" />
        <a href="/" className="m-2 font-mono text-5xl font-bold sm:text-7xl">ZJU Mirror</a>
        <a href="/" className="m-2 text-xl font-bold sm:text-3xl">浙江大学开源软件镜像站</a>
      </div>
    </div>
    <div className="flex flex-col h-full">
      <div className="flex-1 grow" />
      <div className="flex-none hidden px-2 mx-2 lg:flex">
        <div className="flex items-stretch">
          <a href="/iso" className="btn btn-ghost btn-sm rounded-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 mr-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
            ISO
          </a>
        </div>
      </div>
      <div className="flex-none lg:hidden">
        <a href="/iso">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
          </button>
        </a>
      </div>
    </div>
  </div>
);
