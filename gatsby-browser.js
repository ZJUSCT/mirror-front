import './src/styles/global.scss';
import React from 'react';
import RootLayout from './src/utils/root-layout';

export const wrapRootElement = ({ element }) => <RootLayout>{element}</RootLayout>
