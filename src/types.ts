export interface HttpClient {
  post(url: string, data: any, config: any): Promise<any>;
  get(url: string, config: any): Promise<any>;
}

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

export interface RequestResponse {
  commandResponse?: CommandResponse;
}

export interface CommandResponse {
  body?: object;
  completionTime?: string;
  requestTime: string;
  status: string;
  type: string;
  url: string;
}

export interface Result {
  status: string;
  originalResponse: object;
  data?: any;
  message?: string;
}
