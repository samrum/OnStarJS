import { AxiosResponse, AxiosPromise } from "axios";

import TokenHandler from "./TokenHandler";
import Request from "./Request";
import { OAuthToken, OnStarConfig } from "./types";

const ONSTAR_API_BASE = "https://api.gm.com/api/v1";

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

  setAuthToken(authToken: OAuthToken) {
    this.authToken = authToken;
  }

  async authTokenRequest(jwt: string): Promise<AxiosResponse> {
    const request = new Request("/oauth/token")
      .setContentType("text/plain")
      .setAuthRequired(false)
      .setBody(jwt);

    return await this.sendRequest(request);
  }

  async connectRequest(): Promise<AxiosResponse> {
    const request = new Request(
      this.getCommandPath("connect"),
    ).setUpgradeRequired(false);

    return await this.sendRequest(request);
  }

  async upgradeRequest(): Promise<AxiosResponse> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    const request = new Request("/oauth/token/upgrade")
      .setContentType("text/plain")
      .setUpgradeRequired(false)
      .setBody(jwt);

    return await this.sendRequest(request);
  }

  async startRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("start"));

    return await this.sendRequest(request);
  }

  async cancelStartRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("cancelStart"));

    return await this.sendRequest(request);
  }

  async lockDoorRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("lockDoor")).setBody({
      lockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendRequest(request);
  }

  async unlockDoorRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("unlockDoor")).setBody({
      unlockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendRequest(request);
  }

  async alertRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("alert")).setBody({
      alertRequest: {
        action: ["Honk", "Flash"],
        delay: 0,
        duration: 1,
        override: ["DoorOpen", "IgnitionOn"],
      },
    });

    return await this.sendRequest(request);
  }

  async cancelAlertRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("cancelAlert"));

    return await this.sendRequest(request);
  }

  async getChargingProfileRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("getChargingProfile"));

    return await this.sendRequest(request);
  }

  async setChargingProfileRequest(): Promise<AxiosResponse> {
    const request = new Request(
      this.getCommandPath("setChargingProfile"),
    ).setBody({
      chargingProfile: {
        chargeMode: "IMMEDIATE",
        rateType: "MIDPEAK",
      },
    });

    return await this.sendRequest(request);
  }

  async diagnosticsRequest(): Promise<AxiosResponse> {
    const request = new Request(this.getCommandPath("diagnostics")).setBody({
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

    return await this.sendRequest(request);
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

  private getCommandPath(command: string): string {
    return `/account/vehicles/${this.config.vin}/commands/${command}`;
  }

  private async getHeaders(request: Request): Promise<any> {
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

      if (request.isUpgradeRequired() && !authToken.upgraded) {
        await this.connectAndUpgradeAuthToken();
      }

      headers["Authorization"] = `Bearer ${authToken.access_token}`;
    }

    return headers;
  }

  private async getAuthToken(): Promise<OAuthToken> {
    if (!this.authToken || !TokenHandler.authTokenIsValid(this.authToken)) {
      this.authToken = await this.createNewAuthToken();
    }

    return this.authToken;
  }

  private async createNewAuthToken(): Promise<OAuthToken> {
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

  private async sendRequest(request: Request): Promise<AxiosResponse> {
    const onStarUrl = `${ONSTAR_API_BASE}${request.getPath()}`;
    const headers = await this.getHeaders(request);

    return await this.client.post(onStarUrl, request.getBody(), {
      headers,
    });
  }
}

export default RequestService;
