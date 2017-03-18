import HandleResponse from './handleResponse';

const HandleError = (response, status, error, data = null) => {
  response.status = status;

  if (!data) {
    response.body = HandleResponse.failure(error);
  } else {
    response.body = HandleResponse.failure(error, data);
  }
};

export default HandleError;
