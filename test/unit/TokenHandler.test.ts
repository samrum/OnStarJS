import TokenHandler from "../../src/TokenHandler";
import { testConfig, authToken, expiredAuthToken } from "./testData";

let tokenHandler: TokenHandler;

describe("TokenHandler", () => {
  beforeEach(() => {
    tokenHandler = new TokenHandler(testConfig);
  });

  test("authTokenIsValid", () => {
    expect(TokenHandler.authTokenIsValid(authToken)).toBeTruthy();
    expect(TokenHandler.authTokenIsValid(expiredAuthToken)).toBeFalsy();
  });

  test("createUpgradeJWT", () => {
    expect(tokenHandler.createUpgradeJWT().split(".").length - 1).toEqual(2);
  });

  test("createAuthJWT", () => {
    expect(tokenHandler.createAuthJWT().split(".").length - 1).toEqual(2);
  });

  test("decodeAuthRequestResponse", () => {
    const encodedToken = tokenHandler.createAuthJWT();

    expect(tokenHandler.decodeAuthRequestResponse(encodedToken)).toHaveProperty(
      "timestamp",
    );
  });
});
