import axios from "axios";

import TokenHandler from "./TokenHandler";
import RequestService from "./RequestService";

import {
  OnStarConfig,
  Result,
  AlertRequestOptions,
  DiagnosticsRequestOptions,
  SetChargingProfileRequestOptions,
  DoorRequestOptions,
} from "./types";

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

  async lockDoor(options?: DoorRequestOptions): Promise<Result> {
    return this.requestService.lockDoorRequest(options);
  }

  async unlockDoor(options?: DoorRequestOptions): Promise<Result> {
    return this.requestService.unlockDoorRequest(options);
  }

  async alert(options?: AlertRequestOptions): Promise<Result> {
    return this.requestService.alertRequest(options);
  }

  async cancelAlert(): Promise<Result> {
    return this.requestService.cancelAlertRequest();
  }

  async getChargingProfile(): Promise<Result> {
    return this.requestService.getChargingProfileRequest();
  }

  async setChargingProfile(
    options?: SetChargingProfileRequestOptions,
  ): Promise<Result> {
    return this.requestService.setChargingProfileRequest(options);
  }

  async diagnostics(options?: DiagnosticsRequestOptions): Promise<Result> {
    return this.requestService.diagnosticsRequest(options);
  }
}

export default OnStar;
