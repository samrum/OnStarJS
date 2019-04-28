class Request {
  private path: string;
  private requestBody: string = "{}";
  private contentType: string = "application/json; charset=UTF-8";
  private authRequired: boolean = true;

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

  isAuthRequired(): boolean {
    return this.authRequired;
  }

  setAuthRequired(authRequired: boolean) {
    this.authRequired = authRequired;

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
