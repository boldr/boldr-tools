import { combineReducers } from 'redux';
import boldrReducer from './modules/boldr';
import routerReducer from './modules/router';

export function ssrReducer(previousState = {}, action) {
  return previousState;
}

const rootReducer = combineReducers({
  ssr: ssrReducer,
  router: routerReducer,
  boldr: boldrReducer,
});

export default rootReducer;
