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
  ChargeOverrideOptions,
} from "./types";

class OnStar {
  constructor(private requestService: RequestService) {}

  static create(config: OnStarConfig): OnStar {
    const requestService = new RequestService(
      config,
      new TokenHandler(config),
      axios,
    );

    return new OnStar(requestService);
  }

  async getAccountVehicles(): Promise<Result> {
    return this.requestService.getAccountVehicles();
  }

  async start(): Promise<Result> {
    return this.requestService.start();
  }

  async cancelStart(): Promise<Result> {
    return this.requestService.cancelStart();
  }

  async lockDoor(options?: DoorRequestOptions): Promise<Result> {
    return this.requestService.lockDoor(options);
  }

  async unlockDoor(options?: DoorRequestOptions): Promise<Result> {
    return this.requestService.unlockDoor(options);
  }

  async alert(options?: AlertRequestOptions): Promise<Result> {
    return this.requestService.alert(options);
  }

  async cancelAlert(): Promise<Result> {
    return this.requestService.cancelAlert();
  }

  async chargeOverride(options?: ChargeOverrideOptions): Promise<Result> {
    return this.requestService.chargeOverride(options);
  }

  async getChargingProfile(): Promise<Result> {
    return this.requestService.getChargingProfile();
  }

  async setChargingProfile(
    options?: SetChargingProfileRequestOptions,
  ): Promise<Result> {
    return this.requestService.setChargingProfile(options);
  }

  async diagnostics(options?: DiagnosticsRequestOptions): Promise<Result> {
    return this.requestService.diagnostics(options);
  }

  setCheckRequestStatus(checkStatus: boolean) {
    this.requestService.setCheckRequestStatus(checkStatus);
  }
}

export default OnStar;
