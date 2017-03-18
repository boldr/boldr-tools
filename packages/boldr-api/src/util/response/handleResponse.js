export default class HandleResponse {
  static success(message, data = null) {
    const json = {
      success: true,
      message,
    };

    if (data !== null) json.data = data;
    return json;
  }

  static failure(error, data = null) {
    const json = {
      success: false,
      error,
    };

    if (data !== null) json.data = data;
    return json;
  }
}
