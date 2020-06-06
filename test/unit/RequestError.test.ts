import Request from "../../src/Request";
import RequestError from "../../src/RequestError";
import { CommandResponseStatus } from "../../src/types";

describe("RequestError", () => {
  test("Property Methods", () => {
    const requestError = new RequestError("Error Message");
    const response = {
      data: {
        commandResponse: {
          requestTime: "time",
          status: CommandResponseStatus.success,
          type: "unlockDoor",
          url: "https://foo.bar",
        },
      }
    };
    const request = new Request("https://foo.bar");

    requestError.setResponse(response);
    expect(requestError.getResponse()).toEqual(response);

    requestError.setRequest(request);
    expect(requestError.getRequest()).toEqual(request);
  });
});
