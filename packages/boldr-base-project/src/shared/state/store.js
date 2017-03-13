import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { isBrowser } from '../core/utils';
import rootReducer from './reducers';

const inBrowser = typeof window === 'object';

export default function configureStore(preloadedState, history) {
  const middleware = [
    thunkMiddleware,
    createLogger({
      predicate: () => isBrowser && process.env.NODE_ENV !== 'production',
      collapsed: true,
    }),
  ];

  const enhancers = [
    applyMiddleware(...middleware),
  ];

  /* istanbul ignore next */
  const devEnhancers = process.env.NODE_ENV !== 'production' && isBrowser &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  // Creating the store
  const store = createStore(rootReducer, preloadedState, devEnhancers(...enhancers));
  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default; // eslint-disable-line global-require

      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
