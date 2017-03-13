/* @flow */
/* eslint-disable global-require */

import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { App, Root } from '../shared/core/components';
import configureStore from '../shared/state/store';
import ReactHotLoader from './ReactHotLoader';

const MOUNT_POINT = document.getElementById('app');

const preloadedState = window.__PRELOADED_STATE__;
const store = configureStore(preloadedState);

function renderApp(BoldrApp) {
  ReactDOM.render(
    <ReactHotLoader>
    <Provider store={ store }>
      <Root server={ false }>
        <App />
      </Root>
    </Provider>
  </ReactHotLoader>, MOUNT_POINT);
}

if (process.env.NODE_ENV === 'development' && module.hot) {
  // $FlowFixMe
  module.hot.accept(
    '../shared/core/components/App',
    () => renderApp(require('../shared/core/components/App').default),
  );
}

// Execute the first render of our app.
renderApp(App);
