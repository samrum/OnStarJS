import { Result, ResultResponse, CommandResponseStatus } from "./types";

class RequestResult {
  private response?: ResultResponse;
  private message?: string;

  constructor(private status: CommandResponseStatus) {}

  setResponse(response: ResultResponse) {
    this.response = response;

    return this;
  }

  setMessage(message: string) {
    this.message = message;

    return this;
  }

  getResult(): Result {
    const result = {
      status: this.status,
    } as Result;

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
