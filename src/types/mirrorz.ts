// MIT License

// Copyright (c) 2021 Zenithal

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export type MirrorData = {
  version?: number,
  site: Site,
  info: Info[],
  mirrors: Mirror[],
};

export type Site = {
  url: string,
  abbr: string,
  name?: string,
  logo?: string,
  logo_darkmode?: string,
  homepage?: string,
  issue?: string,
  request?: string,
  email?: string,
  group?: string,
  disk?: string,
  note?: string,
  big?: string,
};

export type Info = {
  category: string,
  distro: string,
  urls: { name: string, url: string }[]
};

export type Mirror = {
  cname: string,
  url: string,
  status: string,
  desc?: string,
  help?: string,
  upstream?: string,
  size?: string,
};

export type ParsedMirror = {
  cname: string;
  full: string;
  help: string | null;
  upstream: string | undefined;
  desc: string | undefined;
  status: string;
  size: string | undefined;
  source: string;
  note: string | undefined;
};

// Beta Type
export type VersionData = {
  versionName: string[];
  versionDetail: string[];
};