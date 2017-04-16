import { combineReducers } from 'redux';
import boldrReducer from './modules/boldr';
import { routerReducer as routing } from 'react-router-redux';

const rootReducer = combineReducers({
  routing,
  boldr: boldrReducer,
});

export default rootReducer;
