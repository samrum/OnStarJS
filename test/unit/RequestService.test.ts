import { mock, instance, when, anything } from "ts-mockito";
import TokenHandler from "../../src/TokenHandler";
import { HttpClient, CommandResponseStatus } from "../../src/types";
import RequestService from "../../src/RequestService";
import { testConfig, authToken, expiredAuthToken } from "./testData";

describe("RequestService", () => {
  let requestService: RequestService;
  let httpClient: HttpClient;

  const commandResponseUrl = "requestCheckUrl";

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
              status: CommandResponseStatus.success,
              url: commandResponseUrl,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            commandResponse: {
              requestTime,
              status: CommandResponseStatus.inProgress,
              url: commandResponseUrl,
            },
          },
        }),
      get: jest.fn().mockResolvedValue({
        data: {
          commandResponse: {
            requestTime,
            status: CommandResponseStatus.success,
            url: commandResponseUrl,
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
    const result = await requestService.start();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("cancelStart", async () => {
    const result = await requestService.cancelStart();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("lockDoor", async () => {
    const result = await requestService.lockDoor();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("unlockDoor", async () => {
    const result = await requestService.unlockDoor();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("alert", async () => {
    const result = await requestService.alert();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("cancelAlert", async () => {
    const result = await requestService.cancelAlert();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("chargeOverride", async () => {
    const result = await requestService.chargeOverride();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("getChargingProfile", async () => {
    const result = await requestService.getChargingProfile();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("setChargingProfile", async () => {
    const result = await requestService.setChargingProfile();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("diagnostics", async () => {
    const result = await requestService.diagnostics();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("getAccountVehicles", async () => {
    const result = await requestService.getAccountVehicles();

    expect(result.status).toEqual(CommandResponseStatus.success);
  });

  test("requestWithExpiredAuthToken", async () => {
    httpClient.post = jest
      .fn()
      .mockResolvedValue({
        data: {
          commandResponse: {
            requestTime: Date.now() + 1000,
            status: CommandResponseStatus.success,
            url: commandResponseUrl,
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
          status: CommandResponseStatus.inProgress,
          url: commandResponseUrl,
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
