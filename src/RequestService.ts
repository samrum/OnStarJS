import TokenHandler from "./TokenHandler";
import Request from "./Request";
import RequestResult from "./RequestResult";
import RequestError from "./RequestError";
import {
  HttpClient,
  OAuthToken,
  OnStarConfig,
  RequestResponse,
  Result,
} from "./types";

const ONSTAR_API_BASE = "https://api.gm.com/api/v1";

class RequestService {
  private authToken?: OAuthToken;
  private checkRequestTimeout = 6000;

  constructor(
    private config: OnStarConfig,
    private tokenHandler: TokenHandler,
    private client: HttpClient,
  ) {}

  setClient(client: HttpClient) {
    this.client = client;

    return this;
  }

  setAuthToken(authToken: OAuthToken) {
    this.authToken = authToken;

    return this;
  }

  setCheckRequestTimeout(timeoutMs: number) {
    this.checkRequestTimeout = timeoutMs;

    return this;
  }

  async startRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("start"));

    return await this.sendRequest(request);
  }

  async cancelStartRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("cancelStart"));

    return await this.sendRequest(request);
  }

  async lockDoorRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("lockDoor")).setBody({
      lockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendRequest(request);
  }

  async unlockDoorRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("unlockDoor")).setBody({
      unlockDoorRequest: {
        delay: 0,
      },
    });

    return await this.sendRequest(request);
  }

  async alertRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("alert")).setBody({
      alertRequest: {
        action: ["Honk", "Flash"],
        delay: 0,
        duration: 1,
        override: ["DoorOpen", "IgnitionOn"],
      },
    });

    return await this.sendRequest(request);
  }

  async cancelAlertRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("cancelAlert"));

    return await this.sendRequest(request);
  }

  async getChargingProfileRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("getChargingProfile"));

    return await this.sendRequest(request);
  }

  async setChargingProfileRequest(): Promise<Result> {
    const request = new Request(
      this.getCommandUrl("setChargingProfile"),
    ).setBody({
      chargingProfile: {
        chargeMode: "IMMEDIATE",
        rateType: "MIDPEAK",
      },
    });

    return await this.sendRequest(request);
  }

  async diagnosticsRequest(): Promise<Result> {
    const request = new Request(this.getCommandUrl("diagnostics")).setBody({
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

  private getApiUrlForPath(path: string): string {
    return `${ONSTAR_API_BASE}${path}`;
  }

  private getCommandUrl(command: string): string {
    return `${ONSTAR_API_BASE}/account/vehicles/${
      this.config.vin
    }/commands/${command}`;
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

  private async connectRequest(): Promise<Result> {
    const request = new Request(
      this.getCommandUrl("connect"),
    ).setUpgradeRequired(false);

    return await this.sendRequest(request);
  }

  private async upgradeRequest(): Promise<Result> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    const request = new Request(this.getApiUrlForPath("/oauth/token/upgrade"))
      .setContentType("text/plain")
      .setUpgradeRequired(false)
      .setBody(jwt);

    return await this.sendRequest(request);
  }

  private async authTokenRequest(jwt: string): Promise<Result> {
    const request = new Request(this.getApiUrlForPath("/oauth/token"))
      .setContentType("text/plain")
      .setAuthRequired(false)
      .setBody(jwt);

    return await this.sendRequest(request);
  }

  private async getAuthToken(): Promise<OAuthToken> {
    if (!this.authToken || !TokenHandler.authTokenIsValid(this.authToken)) {
      this.authToken = await this.createNewAuthToken();
    }

    return this.authToken;
  }

  private async createNewAuthToken(): Promise<OAuthToken> {
    const jwt = this.tokenHandler.createAuthJWT();

    const { response } = await this.authTokenRequest(jwt);

    return this.tokenHandler.decodeAuthRequestResponse(response.data);
  }

  private async connectAndUpgradeAuthToken() {
    await this.connectRequest();
    await this.upgradeRequest();

    if (this.authToken) {
      this.authToken.upgraded = true;
    }
  }

  private async sendRequest(request: Request): Promise<Result> {
    try {
      const response = await this.makeClientRequest(request);
      const { data } = response;

      if (request.getContentType().includes("json")) {
        const requestResponse = JSON.parse(data) as RequestResponse;

        const { commandResponse } = requestResponse;

        if (commandResponse) {
          const { status, url } = commandResponse;

          if (status === "inProgress") {
            await this.checkRequestPause();

            const request = new Request(url)
              .setMethod("get")
              .setUpgradeRequired(false);
            return await this.sendRequest(request);
          }

          return new RequestResult(status).setResponse(response).getResult();
        }
      }

      return new RequestResult("success").setResponse(response).getResult();
    } catch (error) {
      let errorObj = new RequestError();

      if (error.response) {
        errorObj.message = "Error response";
        errorObj.setResponse(error.response);
        errorObj.setRequest(error.request);
      } else if (error.request) {
        errorObj.message = "No response";
        errorObj.setRequest(error.request);
      } else {
        errorObj.message = error.message;
      }

      throw errorObj;
    }
  }

  private async makeClientRequest(request: Request): Promise<any> {
    const headers = await this.getHeaders(request);
    const requestOptions = {
      headers,
    };

    if (request.getMethod() === "post") {
      return await this.client.post(
        request.getUrl(),
        request.getBody(),
        requestOptions,
      );
    } else {
      return await this.client.get(request.getUrl(), requestOptions);
    }
  }

  private checkRequestPause() {
    return new Promise(resolve =>
      setTimeout(resolve, this.checkRequestTimeout),
    );
  }
}

export default RequestService;
