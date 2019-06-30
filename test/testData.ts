import { OAuthToken } from "../src/types";

const testConfig = {
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

const expiredAuthToken: OAuthToken = {
  ...authToken,
  expiration: Date.now() - 24 * 60 * 60 * 1000,
};

export { testConfig, authToken, expiredAuthToken };
