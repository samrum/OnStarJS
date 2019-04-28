import { AxiosResponse, AxiosPromise } from "axios";

import OnStarRequest from "./Request";
import { OAuthToken } from "./types";

interface httpClient {
  post(url: string, data: any, config: any): AxiosPromise<any>;
}

class RequestService {
  constructor(private client: httpClient) {}

  async authTokenRequest(jwt: string): Promise<AxiosResponse> {
    const request = new OnStarRequest("/oauth/token")
      .setContentType("text/plain")
      .setRequestBody(jwt);

    return await this.sendOnStarRequest(request);
  }

  async connectRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/connect`,
    ).setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async upgradeRequest(
    jwt: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest("/oauth/token/upgrade")
      .setContentType("text/plain")
      .setAuthToken(authToken)
      .setRequestBody(jwt);

    return await this.sendOnStarRequest(request);
  }

  async startRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/start`,
    ).setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async cancelStartRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/cancelStart`,
    ).setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async lockDoorRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/lockDoor`,
    )
      .setAuthToken(authToken)
      .setRequestBody({
        lockDoorRequest: {
          delay: 0,
        },
      });

    return await this.sendOnStarRequest(request);
  }

  async unlockDoorRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/unlockDoor`,
    )
      .setAuthToken(authToken)
      .setRequestBody({
        unlockDoorRequest: {
          delay: 0,
        },
      });

    return await this.sendOnStarRequest(request);
  }

  async alertRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(`/account/vehicles/${vin}/commands/alert`)
      .setAuthToken(authToken)
      .setRequestBody({
        alertRequest: {
          action: ["Honk", "Flash"],
          delay: 0,
          duration: 1,
          override: ["DoorOpen", "IgnitionOn"],
        },
      });

    return await this.sendOnStarRequest(request);
  }

  async cancelAlertRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/cancelAlert`,
    ).setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async getChargingProfileRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/getChargingProfile`,
    ).setAuthToken(authToken);

    return await this.sendOnStarRequest(request);
  }

  async setChargingProfileRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/setChargingProfile`,
    )
      .setAuthToken(authToken)
      .setRequestBody({
        chargingProfile: {
          chargeMode: "IMMEDIATE",
          rateType: "MIDPEAK",
        },
      });

    return await this.sendOnStarRequest(request);
  }

  async diagnosticsRequest(
    vin: string,
    authToken?: OAuthToken,
  ): Promise<AxiosResponse> {
    const request = new OnStarRequest(
      `/account/vehicles/${vin}/commands/diagnostics`,
    )
      .setAuthToken(authToken)
      .setRequestBody({
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
