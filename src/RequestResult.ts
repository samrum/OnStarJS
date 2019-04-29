import { Result } from "./types";

class RequestResult {
  private originalResponse?: object;
  private message?: string;
  private data?: any;

  constructor(private status: string) {}

  setOriginalResponse(originalResponse: object) {
    this.originalResponse = originalResponse;

    return this;
  }

  setMessage(message: string) {
    this.message = message;

    return this;
  }

  setData(data: any) {
    this.data = data;

    return this;
  }

  getResult(): Result {
    const result = {
      status: this.status,
    } as Result;

    if (this.originalResponse) {
      result.originalResponse = this.originalResponse;
    }

    if (this.message) {
      result.message = this.message;
    }

    if (this.data) {
      result.data = this.data;
    }

    return result;
  }
}

export default RequestResult;
