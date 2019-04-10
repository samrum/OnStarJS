import axios, { AxiosResponse } from "axios";

import TokenHandler from "./TokenHandler";
import RequestService from "./RequestService";

import { OAuthToken, OnStarConfig } from "./types";

class OnStar {
  private authToken?: OAuthToken;

  constructor(
    private config: OnStarConfig,
    private tokenHandler: TokenHandler,
    private requestService: RequestService,
  ) {}

  static create(config: OnStarConfig): OnStar {
    return new OnStar(
      config,
      new TokenHandler(config, new RequestService(axios)),
      new RequestService(axios),
    );
  }

  setTokenHandler(tokenHandler: TokenHandler) {
    this.tokenHandler = tokenHandler;
  }

  async remoteStart(): Promise<AxiosResponse> {
    this.authToken = await this.tokenHandler.refreshAuthToken(this.authToken);

    if (this.authToken && !this.authToken.upgraded) {
      await this.connectAndUpgradeAuthToken();
    }

    return await this.remoteStartRequest();
  }

  private async connectAndUpgradeAuthToken() {
    await this.connectRequest();
    await this.upgradeRequest();

    if (this.authToken) {
      this.authToken.upgraded = true;
    }
  }

  private async connectRequest(): Promise<AxiosResponse> {
    return await this.requestService.connectRequest(
      this.config.vin,
      this.authToken,
    );
  }

  private async upgradeRequest(): Promise<AxiosResponse> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    return await this.requestService.upgradeRequest(jwt, this.authToken);
  }

  private async remoteStartRequest(): Promise<AxiosResponse> {
    return await this.requestService.remoteStartRequest(
      this.config.vin,
      this.authToken,
    );
  }
}

export default OnStar;
