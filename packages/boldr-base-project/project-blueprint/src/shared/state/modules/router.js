export const SET_PATH = 'router/SET_PATH';
export const REPLACE_PATH = 'router/REPLACE_PATH';
export const RECOVER_PATH = '/pingback/';

const initialState = {};

/**
 * [routerReducer description]
 * @param {[type]} [state=initialState] [description]
 * @param {[type]} action [description]
 * @return {[type]} [description]
 */
export default function routerReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PATH:
      return {
        ...state,
        path: action.path,
        replace: false,
      };
    case REPLACE_PATH:
      return {
        ...state,
        path: action.path,
        replace: true,
      };
    default:
      return state;
  }
}

/**
 * [setPath description]
 * @param {[type]} path [description]
 */
export function setPath(path) {
  return {
    type: SET_PATH,
    path,
  };
}

/**
 * [replacePath description]
 * @param {[type]} path [description]
 */
export function replacePath(path) {
  return {
    type: REPLACE_PATH,
    path,
  };
}
