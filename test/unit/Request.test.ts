import Request, { RequestMethod } from "../../src/Request";

describe("Request", () => {
  test("Property Methods", () => {
    const requestUrl = "https://foo.bar/secret/path";
    const request = new Request(requestUrl);
    const method = RequestMethod.Get;
    const contentType = "text/html";
    const body = `{"username":"Ayaya"}`;
    const bodyObject = {
      username: "Ayaya",
    };
    const headers = {
      fooHead: "barValue",
    };

    expect(request.getUrl()).toEqual(requestUrl);

    expect(request.getMethod()).toEqual(RequestMethod.Post);
    request.setMethod(method);
    expect(request.getMethod()).toEqual(method);

    expect(request.getContentType()).toEqual("application/json; charset=UTF-8");
    request.setContentType(contentType);
    expect(request.getContentType()).toEqual(contentType);

    expect(request.getBody()).toEqual("{}");
    request.setBody(body);
    expect(request.getBody()).toEqual(body);
    request.setBody(bodyObject);
    expect(request.getBody()).toEqual(body);

    expect(request.isAuthRequired()).toBeTruthy();
    request.setAuthRequired(false);
    expect(request.isAuthRequired()).toBeFalsy();

    expect(request.isUpgradeRequired()).toBeFalsy();
    request.setUpgradeRequired(false);
    expect(request.isUpgradeRequired()).toBeFalsy();

    expect(request.getHeaders()).toEqual({});
    request.setHeaders(headers);
    expect(request.getHeaders()).toEqual(headers);
  });
});
