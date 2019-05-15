import Request from "./Request";
import { RequestResponse } from "./types";

class RequestError extends Error {
  private response?: RequestResponse;
  private request?: Request;

  constructor(...args: any[]) {
    super(...args);
    Error.captureStackTrace(this, RequestError);
  }

  getResponse(): RequestResponse | undefined {
    return this.response;
  }

  setResponse(response: RequestResponse) {
    this.response = response;

    return this;
  }

  getRequest(): Request | undefined {
    return this.request;
  }

  setRequest(request: Request) {
    this.request = request;

    return this;
  }
}

export default RequestError;
