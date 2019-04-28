import { mock, instance, when, anyString, anything } from "ts-mockito";

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

const upgradedToken: OAuthToken = {
  ...authToken,
  upgraded: true,
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
    const request = new Request("/secret/path");
    const contentType = "text/html";
    const body = `{"username":"Ayaya"}`;
    const objectBody = {
      username: "Ayaya",
    };

    expect(request.getPath()).toEqual("/secret/path");

    expect(request.isAuthRequired()).toBeTruthy();
    request.setAuthRequired(false);
    expect(request.isAuthRequired()).toBeFalsy();

    expect(request.isUpgradeRequired()).toBeTruthy();
    request.setUpgradeRequired(false);
    expect(request.isUpgradeRequired()).toBeFalsy();

    expect(request.getContentType()).toEqual("application/json; charset=UTF-8");
    request.setContentType(contentType);
    expect(request.getContentType()).toEqual(contentType);

    expect(request.getBody()).toEqual("{}");
    request.setBody(body);
    expect(request.getBody()).toEqual(body);
    request.setBody(objectBody);
    expect(request.getBody()).toEqual(body);
  });
});

let requestService: RequestService;

describe("RequestService", () => {
  beforeEach(() => {
    const tokenHandler = mock(TokenHandler);
    when(tokenHandler.createUpgradeJWT()).thenReturn("upgradeJWT");
    when(tokenHandler.createAuthJWT()).thenReturn("authJWT");
    when(tokenHandler.decodeAuthRequestResponse(anything())).thenReturn(
      authToken,
    );

    requestService = new RequestService(config, instance(tokenHandler), {
      post: jest.fn(),
    });
  });

  test("authTokenRequest", async () => {
    await requestService.authTokenRequest("jwt");
  });

  test("connectRequest", async () => {
    await requestService.connectRequest();
  });

  test("upgradeRequest", async () => {
    await requestService.upgradeRequest();
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

  test("expiredAuthTokenReplacedWithNewToken", async () => {
    requestService.setAuthToken(expiredToken);

    await requestService.startRequest();
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
    const response = {
      data:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJPTUJfQ1ZZX0FORF8zRjEiLCJjcmVkZW50aWFsIjoiMTIzNCIsImNyZWRlbnRpYWxfdHlwZSI6IlBJTiIsImRldmljZV9pZCI6ImRldmljZS1pZC1mYWtlIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwibm9uY2UiOiJZekpsTTJSaU1tWmpObVJsTURZek1EVmlOaiIsInRpbWVzdGFtcCI6IjIwMTktMDQtMDhUMDQ6NDY6MDcuMDAxWiJ9.Yi9QANYYzX2XNz5u4_D7tKqAgVk9pZ5FSwJt5jdZvrQ",
    };

    expect(tokenHandler.decodeAuthRequestResponse(response)).not.toEqual(
      authToken,
    );
  });
});
