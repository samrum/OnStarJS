import { AxiosResponse, AxiosPromise } from "axios";

import OnStarRequest from "./Request";
import { OAuthToken } from "./types";

interface httpClient {
  post(url: string, data: any, config: any): AxiosPromise<any>;
}

class RequestService {
  constructor(private client: httpClient) {}

  async authTokenRequest(jwt: string): Promise<AxiosResponse> {
    const request = new OnStarRequest("/oauth/token").setRequestBody(jwt);

    return await this.sendOnStarRequest(request);
  }

  async connectRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/connect`,
    )
      .setContentType("application/json; charset=UTF-8")
      .setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async upgradeRequest(
    jwt: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest("/oauth/token/upgrade")
      .setRequestBody(jwt)
      .setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async remoteStartRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(`/account/vehicles/${vin}/commands/start`)
      .setContentType("application/json; charset=UTF-8")
      .setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  private getHeaders(request: OnStarRequest): any {
    const headers: any = {
      Accept: "application/json",
      "Accept-Language": "en-US",
      "Content-Type": request.getContentType(),
      Host: "api.gm.com",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
      "User-Agent": "okhttp/3.9.0",
    };

    const authToken = request.getAuthToken();

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken.access_token}`;
    }

    return headers;
  }

  private async sendOnStarRequest(
    request: OnStarRequest,
  ): Promise<AxiosResponse> {
    const onStarUrl = `https://api.gm.com/api/v1${request.getPath()}`;
    const headers = this.getHeaders(request);

    return await this.client.post(onStarUrl, request.getRequestBody(), {
      headers,
    });
  }
}

export default RequestService;
