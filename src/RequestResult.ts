import { Result, RequestResponse } from "./types";

class RequestResult {
  private response?: RequestResponse;
  private message?: string;

  constructor(private status: string) {}

  setResponse(response: RequestResponse) {
    this.response = response;

    return this;
  }

  setMessage(message: string) {
    this.message = message;

    return this;
  }

  getResult(): Result {
    const result: Result = {
      status: this.status,
    };

    if (this.response) {
      result.response = this.response;
    }

    if (this.message) {
      result.message = this.message;
    }

    return result;
  }
}

export default RequestResult;
