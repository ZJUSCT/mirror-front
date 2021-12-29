import React from 'react';
import './src/styles/global.css';

import { DataProvider } from './src/context/DataContext';

export const wrapRootElement = ({ element }) => (
    <DataProvider>{element}</DataProvider>
)
