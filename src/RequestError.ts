class RequestError extends Error {
  private response?: object;
  private request?: object;

  constructor(...args: any[]) {
    super(...args);
    Error.captureStackTrace(this, RequestError);
  }

  getResponse(): object | undefined {
    return this.response;
  }

  setResponse(response: object) {
    this.response = response;
  }

  getRequest(): object | undefined {
    return this.request;
  }

  setRequest(request: object) {
    this.request = request;
  }
}

export default RequestError;
