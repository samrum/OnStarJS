import { AxiosResponse, AxiosPromise } from "axios";

import TokenHandler from "./TokenHandler";
import OnStarRequest from "./Request";
import { OAuthToken, OnStarConfig } from "./types";

interface httpClient {
  post(url: string, data: any, config: any): AxiosPromise<any>;
}

class RequestService {
  private authToken?: OAuthToken;

  constructor(
    private config: OnStarConfig,
    private tokenHandler: TokenHandler,
    private client: httpClient,
  ) {}

  async authTokenRequest(jwt: string): Promise<AxiosResponse> {
    const request = new OnStarRequest("/oauth/token")
      .setContentType("text/plain")
      .setAuthRequired(false)
      .setRequestBody(jwt);

    return await this.sendOnStarRequest(request);
  }

  async connectRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/connect`,
    );

    return await this.sendOnStarRequest(request);
  }

  async upgradeRequest(): Promise<AxiosResponse> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    const request = new OnStarRequest("/oauth/token/upgrade")
      .setContentType("text/plain")
      .setRequestBody(jwt);

    return await this.sendOnStarRequest(request);
  }

  async startRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/start`,
    );

    return await this.sendOnStarRequest(request);
  }

  async cancelStartRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/cancelStart`,
    );

    return await this.sendOnStarRequest(request);
  }

  async lockDoorRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/lockDoor`,
    ).setRequestBody({
      lockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendOnStarRequest(request);
  }

  async unlockDoorRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/unlockDoor`,
    ).setRequestBody({
      unlockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendOnStarRequest(request);
  }

  async alertRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/alert`,
    ).setRequestBody({
      alertRequest: {
        action: ["Honk", "Flash"],
        delay: 0,
        duration: 1,
        override: ["DoorOpen", "IgnitionOn"],
      },
    });

    return await this.sendOnStarRequest(request);
  }

  async cancelAlertRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/cancelAlert`,
    );

    return await this.sendOnStarRequest(request);
  }

  async getChargingProfileRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/getChargingProfile`,
    );

    return await this.sendOnStarRequest(request);
  }

  async setChargingProfileRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/setChargingProfile`,
    ).setRequestBody({
      chargingProfile: {
        chargeMode: "IMMEDIATE",
        rateType: "MIDPEAK",
      },
    });

    return await this.sendOnStarRequest(request);
  }

  async diagnosticsRequest(): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${this.config.vin}/commands/diagnostics`,
    ).setRequestBody({
      diagnosticsRequest: {
        diagnosticItem: [
          "ENGINE COOLANT TEMP",
          "ENGINE RPM",
          "LAST TRIP FUEL ECONOMY",
          "EV ESTIMATED CHARGE END",
          "EV BATTERY LEVEL",
          "OIL LIFE",
          "EV PLUG VOLTAGE",
          "LIFETIME FUEL ECON",
          "HOTSPOT CONFIG",
          "LIFETIME FUEL USED",
          "ODOMETER",
          "HOTSPOT STATUS",
          "LIFETIME EV ODOMETER",
          "EV PLUG STATE",
          "EV CHARGE STATE",
          "TIRE PRESSURE",
          "AMBIENT AIR TEMPERATURE",
          "LAST TRIP DISTANCE",
          "INTERM VOLT BATT VOLT",
          "GET COMMUTE SCHEDULE",
          "GET CHARGE MODE",
          "EV SCHEDULED CHARGE START",
          "FUEL TANK INFO",
          "VEHICLE RANGE",
        ],
      },
    });

    return await this.sendOnStarRequest(request);
  }

  // handle response
  // sample
  /*
      "commandResponse": {
        "requestTime": "<TIME>",
        "status": "inProgress",
        "type": "getChargingProfile",
        "url": "https://api.gm.com/api/v1/account/vehicles/<VIN>>/requests/<REQUEST_ID>>"
    }
  */

  /*
    "commandResponse": {
        "completionTime": "<TIME>",
        "requestTime": "<TIME>",
        "status": "success",
        "type": "lockDoor",
        "url": "https://api.gm.com/api/v1/account/vehicles/<VIN>>/requests/<ID>"
    }
  */

  private async getHeaders(request: OnStarRequest): any {
    const headers: any = {
      Accept: "application/json",
      "Accept-Language": "en-US",
      "Content-Type": request.getContentType(),
      Host: "api.gm.com",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
      "User-Agent": "okhttp/3.9.0",
    };

    if (request.isAuthRequired()) {
      const authToken = await this.getAuthToken();

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken.access_token}`;
      }
    }

    return headers;
  }

  private async getAuthToken(): Promise<OAuthToken> {
    if (!this.authToken || !TokenHandler.authTokenIsValid(this.authToken)) {
      this.authToken = await this.createAndInitializeAuthToken();
    }

    if (!this.authToken.upgraded) {
      await this.connectAndUpgradeAuthToken();
    }

    return this.authToken;
  }

  private async createAndInitializeAuthToken(): Promise<OAuthToken> {
    const jwt = this.tokenHandler.createAuthJWT();

    const authRequestResponse = await this.authTokenRequest(jwt);

    return this.tokenHandler.decodeAuthRequestResponse(authRequestResponse);
  }

  private async connectAndUpgradeAuthToken() {
    await this.connectRequest();
    await this.upgradeRequest();

    if (this.authToken) {
      this.authToken.upgraded = true;
    }
  }

  private async sendOnStarRequest(
    request: OnStarRequest,
  ): Promise<AxiosResponse> {
    const onStarUrl = `https://api.gm.com/api/v1${request.getPath()}`;
    const headers = await this.getHeaders(request);

    return await this.client.post(onStarUrl, request.getRequestBody(), {
      headers,
    });
  }
}

export default RequestService;
