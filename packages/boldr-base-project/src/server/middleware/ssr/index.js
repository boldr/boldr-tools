import React from 'react';
import ReactDOM from 'react-dom/server';
import { matchPath } from 'react-router-dom';
import { Provider } from 'react-redux';

import { App, Root } from '../../../shared/core/components';
import routes from '../../../shared/scenes/index';
import configureStore from '../../../shared/state/store';
import createHtml from './createHtml';

const preloadedState = {};
const store = configureStore(preloadedState);

export default (async function ssrMiddleware(req, res, next) {
  const { nonce } = res.locals;
  const context = {};
  const WrappedApp = (
    <Provider store={ store }>
      <Root
        server={ {
          context,
          location: req.url,
        } }
      >
        <App />
      </Root>
    </Provider>
  );

  await new Promise((resolve, reject) => {
    const matches = routes.reduce(
      (matches, route) => {
        const match = matchPath(req.url, route);
        if (match) {
          matches.push({
            route,
            match,
            promise: route.component.fetchData
              ? store.dispatch(route.component.fetchData(match.params))
              : Promise.resolve(null),
          });
        }
        return matches;
      },
      [],
    );

    if (!matches.length) {
      res.status(404).json('Server error');
      console.log('No matched routes from react-router');
      return reject();
    }

    if (context.url) {
      res.status(302).setHeader('Location', context.url);
      res.end();
      return;
    }

    const promises = matches.map(match => match.promise);
    Promise.all(promises).then(() => {
      const markup = createHtml(WrappedApp, store.getState(), nonce);

      res.status(200).send(markup);
      return resolve();
    }, err => {
      res.status(500).json('Server error');
      return reject(err);
    });
  });
  await next();
});
