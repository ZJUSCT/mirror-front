import './src/styles/global.scss';
import React from 'react';
import RootLayout from './src/utils/root-layout';

export const wrapRootElement = ({ element }) => (
  <RootLayout>{element}</RootLayout>
);

export const onRenderBody = ({ pathname, setPreBodyComponents }) => {
  if (pathname && pathname.startsWith('/fancy-index')) {
    setPreBodyComponents([
      <div style={{ display: 'none' }}>
        <div id="fancy-start" />
        <div id="fancy-end" />
      </div>,
    ]);
  }
};
