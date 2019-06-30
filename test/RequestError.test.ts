import Request from "../src/Request";
import RequestError from "../src/RequestError";

describe("RequestError", () => {
  test("Property Methods", () => {
    const requestError = new RequestError("Error Message");
    const response = {
      commandResponse: {
        requestTime: "time",
        status: "success",
        type: "unlockDoor",
        url: "https://foo.bar",
      },
    };
    const request = new Request("https://foo.bar");

    requestError.setResponse(response);
    expect(requestError.getResponse()).toEqual(response);

    requestError.setRequest(request);
    expect(requestError.getRequest()).toEqual(request);
  });
});
