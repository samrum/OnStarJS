import { mock, instance, when, anyString, anything } from "ts-mockito";
import { AxiosResponse } from "axios";

import { OAuthToken } from "../src/types";
import OnStar from "../src/index";
import TokenHandler from "../src/TokenHandler";
import Request from "../src/Request";
import RequestService from "../src/RequestService";

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
    const tokenHandler = mock(TokenHandler);
    when(tokenHandler.createUpgradeJWT()).thenReturn("upgradeJWT");
    when(tokenHandler.refreshAuthToken(anything())).thenResolve(authToken);

    const requestService = mock(RequestService);

    onStar = new OnStar(
      config,
      instance(tokenHandler),
      instance(requestService),
    );
  });

  test("create", () => {
    expect(OnStar.create(config)).toBeInstanceOf(OnStar);
  });

  test("remoteStart", async () => {
    await onStar.remoteStart();
  });

  test("remoteStartWithUpgradedToken", async () => {
    const upgradedToken = { ...authToken, upgraded: true };

    const tokenHandler = mock(TokenHandler);
    when(tokenHandler.refreshAuthToken(anything())).thenResolve(upgradedToken);

    onStar.setTokenHandler(instance(tokenHandler));

    await onStar.remoteStart();
  });
});

describe("Request", () => {
  test("Access Methods Work", () => {
    const request = new Request("/secret/path");
    const contentType = "text/html";
    const requestBody = `{username: "Ayaya"}`;

    expect(request.getPath()).toEqual("/secret/path");

    expect(request.getAuthToken()).toBeUndefined();
    request.setAuthToken(authToken);
    expect(request.getAuthToken()).toEqual(authToken);

    expect(request.getContentType()).toEqual("text/plain");
    request.setContentType(contentType);
    expect(request.getContentType()).toEqual(contentType);

    expect(request.getRequestBody()).toEqual("{}");
    request.setRequestBody(requestBody);
    expect(request.getRequestBody()).toEqual(requestBody);
  });
});

let requestService: RequestService;

describe("RequestService", () => {
  beforeEach(() => {
    requestService = new RequestService({
      post: jest.fn(),
    });
  });

  test("authTokenRequest", async () => {
    await requestService.authTokenRequest("jwt");
  });

  test("connectRequest", async () => {
    await requestService.connectRequest("vin", authToken);
  });

  test("upgradeRequest", async () => {
    await requestService.upgradeRequest("vin", authToken);
  });

  test("remoteStartRequest", async () => {
    await requestService.remoteStartRequest("vin", authToken);
  });
});

let tokenHandler: TokenHandler;

describe("TokenHandler", () => {
  beforeEach(() => {
    const mockRequestService = mock(RequestService);
    when(mockRequestService.authTokenRequest(anyString())).thenResolve({
      data:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJPTUJfQ1ZZX0FORF8zRjEiLCJjcmVkZW50aWFsIjoiMTIzNCIsImNyZWRlbnRpYWxfdHlwZSI6IlBJTiIsImRldmljZV9pZCI6ImRldmljZS1pZC1mYWtlIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwibm9uY2UiOiJZekpsTTJSaU1tWmpObVJsTURZek1EVmlOaiIsInRpbWVzdGFtcCI6IjIwMTktMDQtMDhUMDQ6NDY6MDcuMDAxWiJ9.Yi9QANYYzX2XNz5u4_D7tKqAgVk9pZ5FSwJt5jdZvrQ",
    } as AxiosResponse);

    tokenHandler = new TokenHandler(config, instance(mockRequestService));
  });

  test("authTokenIsValid", () => {
    expect(TokenHandler.authTokenIsValid(authToken)).toBeTruthy();
    expect(TokenHandler.authTokenIsValid(expiredToken)).toBeFalsy();
  });

  test("refreshAuthToken", async () => {
    expect(await tokenHandler.refreshAuthToken(authToken)).toEqual(authToken);

    expect(await tokenHandler.refreshAuthToken(expiredToken)).not.toEqual(
      authToken,
    );
  });

  test("createUpgradeJWT", () => {
    expect(tokenHandler.createUpgradeJWT().split(".").length - 1).toEqual(2);
  });
});
