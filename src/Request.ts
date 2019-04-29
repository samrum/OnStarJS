class Request {
  private url: string;
  private method: string = "post";
  private body: string = "{}";
  private contentType: string = "application/json; charset=UTF-8";
  private authRequired: boolean = true;
  private upgradeRequired: boolean = true;

  constructor(url: string) {
    this.url = url;
  }

  getUrl(): string {
    return this.url;
  }

  getMethod(): string {
    return this.method;
  }

  setMethod(method: string) {
    this.method = method;

    return this;
  }

  getBody(): string {
    return this.body;
  }

  setBody(body: string | object) {
    if (typeof body === "object") {
      body = JSON.stringify(body);
    }

    this.body = body;

    return this;
  }

  isAuthRequired(): boolean {
    return this.authRequired;
  }

  setAuthRequired(authRequired: boolean) {
    this.authRequired = authRequired;

    return this;
  }

  isUpgradeRequired(): boolean {
    return this.upgradeRequired;
  }

  setUpgradeRequired(upgradeRequired: boolean) {
    this.upgradeRequired = upgradeRequired;

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
