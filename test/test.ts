import { mock, instance, when, anyString, anything } from "ts-mockito";

import { OAuthToken } from "../src/types";
import OnStar from "../src/index";
import TokenHandler from "../src/TokenHandler";
import Request from "../src/Request";
import RequestService from "../src/RequestService";
import RequestResult from "../src/RequestResult";

const config = {
  deviceId: "742249ce-18e0-4c82-8bb2-9975367a7631",
  vin: "1G2ZF58B774109863",
  username: "foo@bar.com",
  password: "p@ssw0rd",
  onStarPin: "1234",
};

const authToken: OAuthToken = {
  access_token: "access_token",
  token_type: "token_type",
  expires_in: 1800,
  scope: "onstar commerce msso gmoc role_owner",
  onstar_account_info: {
    country_code: "US",
    account_no: "123456789",
  },
  user_info: {
    RemoteUserId: "N9876432",
    country: "US",
  },
  id_token: "id_token",
  expiration: Date.now() + 24 * 60 * 60 * 1000,
  upgraded: false,
};

const expiredToken: OAuthToken = {
  ...authToken,
  expiration: Date.now() - 24 * 60 * 60 * 1000,
};

let onStar: OnStar;

describe("OnStar", () => {
  beforeEach(() => {
    const requestService = mock(RequestService);

    onStar = new OnStar(config, instance(requestService));
  });

  test("create", () => {
    expect(OnStar.create(config)).toBeInstanceOf(OnStar);
  });

  test("start", async () => {
    await onStar.start();
  });

  test("cancelStart", async () => {
    await onStar.cancelStart();
  });
});

describe("Request", () => {
  test("Access Methods Work", () => {
    const requestUrl = "https://foo.bar/secret/path";
    const request = new Request(requestUrl);
    const method = "get";
    const contentType = "text/html";
    const body = `{"username":"Ayaya"}`;
    const bodyObject = {
      username: "Ayaya",
    };

    expect(request.getUrl()).toEqual(requestUrl);

    expect(request.getMethod()).toEqual("post");
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

    expect(request.isUpgradeRequired()).toBeTruthy();
    request.setUpgradeRequired(false);
    expect(request.isUpgradeRequired()).toBeFalsy();
  });
});

describe("RequestResult", () => {
  test("Access Methods Work", () => {
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

let requestService: RequestService;
let httpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

describe("RequestService", () => {
  beforeEach(() => {
    const tokenHandler = mock(TokenHandler);
    when(tokenHandler.decodeAuthRequestResponse(anything())).thenReturn(
      authToken,
    );

    httpClient.post.mockResolvedValue({
      data: JSON.stringify({
        commandResponse: {
          status: "inProgress",
        },
      }),
      headers: [],
    });

    httpClient.get.mockResolvedValue({
      data: JSON.stringify({
        commandResponse: {
          status: "success",
        },
      }),
      headers: [],
    });

    requestService = new RequestService(
      config,
      instance(tokenHandler),
      httpClient,
    );

    requestService.setCheckRequestTimeout(1);
  });

  test("startRequest", async () => {
    await requestService.startRequest();
  });

  test("cancelStartRequest", async () => {
    await requestService.cancelStartRequest();
  });

  test("lockDoorRequest", async () => {
    await requestService.lockDoorRequest();
  });

  test("unlockDoorRequest", async () => {
    await requestService.unlockDoorRequest();
  });

  test("alertRequest", async () => {
    await requestService.alertRequest();
  });

  test("cancelAlertRequest", async () => {
    await requestService.cancelAlertRequest();
  });

  test("getChargingProfileRequest", async () => {
    await requestService.getChargingProfileRequest();
  });

  test("setChargingProfileRequest", async () => {
    await requestService.setChargingProfileRequest();
  });

  test("diagnosticsRequest", async () => {
    await requestService.diagnosticsRequest();
  });

  test("setAuthToken", async () => {
    requestService.setAuthToken(expiredToken);
  });

  test("requestResponseError", async () => {
    httpClient.post.mockRejectedValue({
      response: {
        status: "responseStatus",
        data: "data",
      },
    });

    await expect(
      requestService.setClient(httpClient).startRequest(),
    ).rejects.toThrow(/^Error response$/);
  });

  test("requestNoResponseError", async () => {
    httpClient.post.mockRejectedValue({
      request: {
        body: "requestBody",
      },
    });

    await expect(
      requestService.setClient(httpClient).startRequest(),
    ).rejects.toThrow(/^No response$/);
  });

  test("requestStandardError", async () => {
    httpClient.post.mockRejectedValue({
      message: "errorMessage",
    });

    await expect(
      requestService.setClient(httpClient).startRequest(),
    ).rejects.toThrow(/^errorMessage$/);
  });
});

let tokenHandler: TokenHandler;

describe("TokenHandler", () => {
  beforeEach(() => {
    tokenHandler = new TokenHandler(config);
  });

  test("authTokenIsValid", () => {
    expect(TokenHandler.authTokenIsValid(authToken)).toBeTruthy();
    expect(TokenHandler.authTokenIsValid(expiredToken)).toBeFalsy();
  });

  test("createUpgradeJWT", () => {
    expect(tokenHandler.createUpgradeJWT().split(".").length - 1).toEqual(2);
  });

  test("createAuthJWT", () => {
    expect(tokenHandler.createAuthJWT().split(".").length - 1).toEqual(2);
  });

  test("decodeAuthRequestResponse", () => {
    const encodedToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJPTUJfQ1ZZX0FORF8zRjEiLCJjcmVkZW50aWFsIjoiMTIzNCIsImNyZWRlbnRpYWxfdHlwZSI6IlBJTiIsImRldmljZV9pZCI6ImRldmljZS1pZC1mYWtlIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwibm9uY2UiOiJZekpsTTJSaU1tWmpObVJsTURZek1EVmlOaiIsInRpbWVzdGFtcCI6IjIwMTktMDQtMDhUMDQ6NDY6MDcuMDAxWiJ9.Yi9QANYYzX2XNz5u4_D7tKqAgVk9pZ5FSwJt5jdZvrQ";

    expect(tokenHandler.decodeAuthRequestResponse(encodedToken)).toHaveProperty(
      "timestamp",
    );
  });
});
