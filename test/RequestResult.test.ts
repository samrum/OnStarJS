import RequestResult from "../src/RequestResult";

describe("RequestResult", () => {
  test("Property Methods", () => {
    const status = "success";
    const requestResult = new RequestResult(status);
    const response = { data: "responseData" };
    const message = "message";

    expect(requestResult.getResult()).toEqual({
      status,
    });

    requestResult.setResponse(response);
    requestResult.setMessage(message);

    expect(requestResult.getResult()).toEqual({
      status,
      response,
      message,
    });
  });
});
