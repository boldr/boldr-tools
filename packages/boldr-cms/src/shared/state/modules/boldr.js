import api from '../../core/api';

export const FETCH_DATA_REQUEST = '@boldr/FETCH_DATA_REQUEST';
export const FETCH_DATA_SUCCESS = '@boldr/FETCH_DATA_SUCCESS';
export const FETCH_DATA_FAILURE = '@boldr/FETCH_DATA_FAILURE';

function requestDataStart() {
  return { type: FETCH_DATA_REQUEST };
}

function gotRequestData(json) {
  console.log(json);
  return {
    type: FETCH_DATA_SUCCESS,
    payload: json,
  };
}

function failedToGetData(err) {
  console.log(err);
  return {
    type: FETCH_DATA_FAILURE,
    error: err.message,
  };
}
export const getAppData = () => {
  return (dispatch, getState) => {
    dispatch(requestDataStart());
    return api.get('/posts')
  .then(json => dispatch(gotRequestData(json)))
  .catch(err => dispatch(failedToGetData(err)));
  };
};

const initialState = {
  data: null,
  isFetching: false,
  loaded: false,
  error: null,
};

function boldrReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_DATA_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        isFetching: false,
        loaded: true,
        data: action.payload,
      };
    case FETCH_DATA_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };
    default:
      return state;
  }
}

export default boldrReducer;
