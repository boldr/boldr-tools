/* @flow */
import React from 'react';
import type { ReactChildren } from '../typedefs/react';

const ReactHotLoader =
  process.env.NODE_ENV === 'development'
  ? require('react-hot-loader').AppContainer
  : ({ children }: { children?: ReactChildren}) => React.Children.only(children);

export default ReactHotLoader;
