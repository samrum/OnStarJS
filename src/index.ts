import axios, { AxiosResponse } from "axios";

import TokenHandler from "./TokenHandler";
import RequestService from "./RequestService";

import { OnStarConfig } from "./types";

class OnStar {
  constructor(
    private config: OnStarConfig,
    private requestService: RequestService,
  ) {}

  static create(config: OnStarConfig): OnStar {
    const requestService = new RequestService(
      config,
      new TokenHandler(config),
      axios,
    );

    return new OnStar(config, requestService);
  }

  async start(): Promise<AxiosResponse> {
    return await this.requestService.startRequest();
  }

  async cancelStart(): Promise<AxiosResponse> {
    return await this.requestService.cancelStartRequest();
  }
}

export default OnStar;
