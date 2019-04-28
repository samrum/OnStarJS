import { OAuthToken } from "./types";

class Request {
  private path: string;
  private requestBody: string = "{}";
  private contentType: string = "application/json; charset=UTF-8";
  private authToken?: OAuthToken;

  constructor(path: string) {
    this.path = path;
  }

  getPath(): string {
    return this.path;
  }

  getRequestBody(): string {
    return this.requestBody;
  }

  setRequestBody(body: string | object) {
    let requestBody = body;

    if (typeof requestBody === "object") {
      requestBody = JSON.stringify(requestBody);
    }

    this.requestBody = requestBody;

    return this;
  }

  getAuthToken(): OAuthToken | undefined {
    return this.authToken;
  }

  setAuthToken(token?: OAuthToken) {
    this.authToken = token;

    return this;
  }

  getContentType(): string {
    return this.contentType;
  }

  setContentType(type: string) {
    this.contentType = type;

    return this;
  }
}

export default Request;
