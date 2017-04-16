import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import createHistory from 'history/createMemoryHistory';
import { StaticRouter } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import styleSheet from 'styled-components/lib/models/StyleSheet';
import Helmet from 'react-helmet';

import configureStore from '../../../shared/state/store';
import renderRoutes from '../../../shared/core/addRoutes';
import routes from '../../../shared/routes';
import ServerHtml from './ServerHtml';

function renderAppToString(store, routerContext, req) {
  return renderToString(
    <Provider store={ store }>
      <StaticRouter location={ req.url } context={ routerContext }>
        {renderRoutes(routes)}
      </StaticRouter>
    </Provider>,
  );
}

function ssrMiddleware(req, res, next) {
  const { nonce } = res.locals;
  global.navigator = { userAgent: req.headers['user-agent'] };

  const createStore = req => configureStore({});

  const history = createHistory();
  const store = createStore(history);

  const routerContext = {};
  const loadBranchData = async () => {
      const branch = await matchRoutes(routes, req.url);
      const promises = branch.map(({ route, match }) => {
        // Dispatch the action(s) through the loadData method of "./routes.js"
        if (route.loadData) {
          return route.loadData(store.dispatch, match.params);
        }

        return Promise.resolve(null);
      });

      return Promise.all(promises);
    };
    // Send response after all the action(s) are dispathed
    loadBranchData()
      .then(() => {
        // Checking is page is 404
        const status = routerContext.status === '404' ? 404 : 200;

        const reactAppString = renderAppToString(store, routerContext, req);

        const helmet = Helmet.rewind();
        // render styled-components styleSheets to string.
        const styles = styleSheet.rules().map(rule => rule.cssText).join('\n');
        const html = renderToStaticMarkup(
               <ServerHtml
                 reactAppString={ reactAppString }
                 nonce={ nonce }
                 helmet={ Helmet.rewind() }
                 styles={ styles }
                 preloadedState={ store.getState() }
               />,
             );
        // Check if the render result contains a redirect, if so we need to set
        // the specific status and redirect header and end the response
        if (routerContext.url) {
          res.status(301).setHeader('Location', routerContext.url);
          res.end();

          return;
        }

        // Pass the route and initial state into html template
        return res.status(status).send(`<!DOCTYPE html>${html}`);
      })
      .catch(err => {
        res.status(404).send('Not Found :(');

        console.error(`==> 😭  Rendering routes error: ${err}`);
      });
  }
  export default ssrMiddleware;