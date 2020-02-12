import { mock, instance, when, anything } from "ts-mockito";
import TokenHandler from "../../src/TokenHandler";
import { HttpClient } from "../../src/types";
import RequestService from "../../src/RequestService";
import { testConfig, authToken, expiredAuthToken } from "./testData";

let requestService: RequestService;
let httpClient: HttpClient;

describe("RequestService", () => {
  beforeEach(() => {
    const tokenHandler = mock(TokenHandler);
    when(tokenHandler.decodeAuthRequestResponse(anything())).thenReturn(
      authToken,
    );

    const requestTime = Date.now() + 1000;

    httpClient = {
      post: jest
        .fn()
        .mockResolvedValue({
          data: {
            commandResponse: {
              requestTime,
              status: "success",
              url: "requestCheckUrl",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            commandResponse: {
              requestTime,
              status: "inProgress",
              url: "requestCheckUrl",
            },
          },
        }),
      get: jest.fn().mockResolvedValue({
        data: {
          commandResponse: {
            requestTime,
            status: "success",
            url: "requestCheckUrl",
          },
        },
      }),
    };

    requestService = new RequestService(
      testConfig,
      instance(tokenHandler),
      httpClient,
    );

    requestService.setAuthToken(authToken);
    requestService.setCheckRequestTimeout(1);
  });

  test("start", async () => {
    await requestService.start();
  });

  test("cancelStart", async () => {
    await requestService.cancelStart();
  });

  test("lockDoor", async () => {
    await requestService.lockDoor();
  });

  test("unlockDoor", async () => {
    await requestService.unlockDoor();
  });

  test("alert", async () => {
    await requestService.alert();
  });

  test("cancelAlert", async () => {
    await requestService.cancelAlert();
  });

  test("chargeOverride", async () => {
    await requestService.chargeOverride();
  });

  test("getChargingProfile", async () => {
    await requestService.getChargingProfile();
  });

  test("setChargingProfile", async () => {
    await requestService.setChargingProfile();
  });

  test("diagnostics", async () => {
    await requestService.diagnostics();
  });

  test("getAccountVehicles", async () => {
    await requestService.getAccountVehicles();
  });

  test("requestWithExpiredAuthToken", async () => {
    httpClient.post = jest
      .fn()
      .mockResolvedValue({
        data: {
          commandResponse: {
            requestTime: Date.now() + 1000,
            status: "success",
            url: "requestCheckUrl",
          },
        },
      })
      .mockResolvedValueOnce({
        data: "encodedToken",
      });

    requestService.setAuthToken(expiredAuthToken);

    requestService.setClient(httpClient).start();
  });

  test("requestCheckExceedsTimeoutError", async () => {
    httpClient.post = jest.fn().mockResolvedValue({
      data: {
        commandResponse: {
          requestTime: Date.now() - 1000,
          status: "inProgress",
          url: "requestCheckUrl",
        },
      },
    });

    await expect(requestService.setClient(httpClient).start()).rejects.toThrow(
      /^Command Timeout$/,
    );
  });

  test("requestStatusFailureError", async () => {
    httpClient.post = jest.fn().mockResolvedValue({
      data: {
        commandResponse: {
          requestTime: Date.now() + 1000,
          status: "failure",
        },
      },
    });

    await expect(requestService.setClient(httpClient).start()).rejects.toThrow(
      /^Command Failure$/,
    );
  });

  test("requestResponseError", async () => {
    httpClient.post = jest.fn().mockRejectedValue({
      response: {
        status: "400",
        statusText: "invalid_client",
        data: "data",
      },
    });

    await expect(requestService.setClient(httpClient).start()).rejects.toThrow(
      /^Request Failed with status 400 - invalid_client$/,
    );
  });

  test("requestNoResponseError", async () => {
    httpClient.post = jest.fn().mockRejectedValue({
      request: {
        body: "requestBody",
      },
    });

    await expect(requestService.setClient(httpClient).start()).rejects.toThrow(
      /^No response$/,
    );
  });

  test("requestStandardError", async () => {
    httpClient.post = jest.fn().mockRejectedValue({
      message: "errorMessage",
    });

    await expect(requestService.setClient(httpClient).start()).rejects.toThrow(
      /^errorMessage$/,
    );
  });
});
