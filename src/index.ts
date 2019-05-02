import axios from "axios";

import TokenHandler from "./TokenHandler";
import RequestService from "./RequestService";

import { OnStarConfig, Result } from "./types";

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

  async start(): Promise<Result> {
    return this.requestService.startRequest();
  }

  async cancelStart(): Promise<Result> {
    return this.requestService.cancelStartRequest();
  }

  async lockDoor(): Promise<Result> {
    return this.requestService.lockDoorRequest();
  }

  async unlockDoor(): Promise<Result> {
    return this.requestService.unlockDoorRequest();
  }
}

export default OnStar;
