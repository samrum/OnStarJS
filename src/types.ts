export interface OnStarConfig {
  deviceId: string;
  vin: string;
  username: string;
  password: string;
  onStarPin: string;
}

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  onstar_account_info: OnStarAccountInfo;
  user_info: UserInfo;
  id_token: string;
  expiration: number;
  upgraded: boolean;
}

interface OnStarAccountInfo {
  country_code: string;
  account_no: string;
}

interface UserInfo {
  RemoteUserId: string;
  country: string;
}

export interface CreateTokenResponse {
  token: OAuthToken;
}

export interface RemoteStartResponse {
  success: boolean;
}
