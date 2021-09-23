import React, { Component } from "react"
import { defaults } from "autoprefixer"

export default () => (
  <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
    <div className="flex-1 px-2 mx-2">
    <span className="text-lg font-bold">
            ZJU Mirror
          </span>
    </div>
    <div className="flex-none hidden px-2 mx-2 lg:flex">
      <div className="flex items-stretch">
        <a className="btn btn-ghost btn-sm rounded-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               className="inline-block w-5 mr-2 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          RSS

        </a>
        <a className="btn btn-ghost btn-sm rounded-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               className="inline-block w-5 mr-2 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          nEWS

        </a>
        <a className="btn btn-ghost btn-sm rounded-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               className="inline-block w-5 mr-2 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
          rAW

        </a>
      </div>
    </div>
    <div className="flex-none">
      <button className="btn btn-square btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             className="inline-block w-6 h-6 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </div>
)