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
    const requestService = new RequestService(config, axios);

    return new OnStar(
      config,
      new TokenHandler(config, requestService),
      requestService,
    );
  }

  setTokenHandler(tokenHandler: TokenHandler) {
    this.tokenHandler = tokenHandler;
  }

  async start(): Promise<AxiosResponse> {
    return await this.authRequestDecorator(this.startRequest.bind(this));
  }

  async cancelStart(): Promise<AxiosResponse> {
    return await this.authRequestDecorator(this.cancelStartRequest.bind(this));
  }

  private async authRequestDecorator(request: Function) {
    this.authToken = await this.tokenHandler.refreshAuthToken(this.authToken);

    if (this.authToken && !this.authToken.upgraded) {
      await this.connectAndUpgradeAuthToken();
    }

    return await request();
  }

  private async connectAndUpgradeAuthToken() {
    await this.connectRequest();
    await this.upgradeRequest();

    if (this.authToken) {
      this.authToken.upgraded = true;
    }
  }

  private async connectRequest(): Promise<AxiosResponse> {
    return await this.requestService.connectRequest(this.authToken);
  }

  private async upgradeRequest(): Promise<AxiosResponse> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    return await this.requestService.upgradeRequest(jwt, this.authToken);
  }

  private async startRequest(): Promise<AxiosResponse> {
    return await this.requestService.startRequest(this.authToken);
  }

  private async cancelStartRequest(): Promise<AxiosResponse> {
    return await this.requestService.cancelStartRequest(this.authToken);
  }
}

export default OnStar;
