import TokenHandler from "./TokenHandler";
import Request, { RequestMethod } from "./Request";
import RequestResult from "./RequestResult";
import RequestError from "./RequestError";
import {
  HttpClient,
  OAuthToken,
  OnStarConfig,
  Result,
  AlertRequestOptions,
  DiagnosticsRequestOptions,
  SetChargingProfileRequestOptions,
  DoorRequestOptions,
  ChargeOverrideOptions,
} from "./types";

const ONSTAR_API_BASE = "https://api.gm.com/api/v1";

class RequestService {
  private config: OnStarConfig;
  private authToken?: OAuthToken;
  private checkRequestTimeout = 6000;

  constructor(
    config: OnStarConfig,
    private tokenHandler: TokenHandler,
    private client: HttpClient,
  ) {
    this.config = {
      checkRequestStatus: true,
      ...config,
    };
  }

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

  async start(): Promise<Result> {
    const request = new Request(this.getCommandUrl("start"));

    return await this.sendRequest(request);
  }

  async cancelStart(): Promise<Result> {
    const request = new Request(this.getCommandUrl("cancelStart"));

    return await this.sendRequest(request);
  }

  async lockDoor(options?: DoorRequestOptions): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(this.getCommandUrl("lockDoor")).setBody({
      lockDoorRequest: {
        delay: 0,
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async unlockDoor(options?: DoorRequestOptions): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(this.getCommandUrl("unlockDoor")).setBody({
      unlockDoorRequest: {
        delay: 0,
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async alert(options?: AlertRequestOptions): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(this.getCommandUrl("alert")).setBody({
      alertRequest: {
        action: ["Honk", "Flash"],
        delay: 0,
        duration: 1,
        override: ["DoorOpen", "IgnitionOn"],
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async cancelAlert(): Promise<Result> {
    const request = new Request(this.getCommandUrl("cancelAlert"));

    return await this.sendRequest(request);
  }

  async chargeOverride(options?: ChargeOverrideOptions): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(this.getCommandUrl("chargeOverride")).setBody({
      chargeOverrideRequest: {
        mode: "CHARGE_NOW",
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async getChargingProfile(): Promise<Result> {
    const request = new Request(this.getCommandUrl("getChargingProfile"));

    return await this.sendRequest(request);
  }

  async setChargingProfile(
    options?: SetChargingProfileRequestOptions,
  ): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(
      this.getCommandUrl("setChargingProfile"),
    ).setBody({
      chargingProfile: {
        chargeMode: "IMMEDIATE",
        rateType: "MIDPEAK",
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async diagnostics(options?: DiagnosticsRequestOptions): Promise<Result> {
    const userOptions = options || {};

    const request = new Request(this.getCommandUrl("diagnostics")).setBody({
      diagnosticsRequest: {
        diagnosticItem: [
          "ODOMETER",
          "TIRE PRESSURE",
          "AMBIENT AIR TEMPERATURE",
          "LAST TRIP DISTANCE",
        ],
        ...userOptions,
      },
    });

    return await this.sendRequest(request);
  }

  async getAccountVehicles(): Promise<Result> {
    const request = new Request(
      `${ONSTAR_API_BASE}/account/vehicles?includeCommands=true&includeEntit%20lements=true&includeModules=true`,
    )
      .setUpgradeRequired(false)
      .setMethod(RequestMethod.Get);

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
      Connection: "keep-alive",
      "Accept-Encoding": "br, gzip, deflate",
      "User-Agent": "myChevrolet/3.17.0 (iPhone; iOS 12.1.1; Scale/2.00)",
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
      .setBody(jwt)
      .setHeaders({
        "Accept-Language": "en",
        "User-Agent": "myChevrolet/246 CFNetwork/976 Darwin/18.2.0",
      });

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

      if (this.config.checkRequestStatus && typeof data === "object") {
        const { commandResponse } = data;

        if (commandResponse) {
          const { requestTime, status, url, type } = commandResponse;

          const requestTimestamp = new Date(requestTime).getTime();

          const requestGiveup = this.checkRequestTimeout * 10;

          if (Date.now() >= requestTimestamp + requestGiveup) {
            throw new RequestError("Command Timeout")
              .setResponse(response)
              .setRequest(request);
          }

          if (status === "failure") {
            throw new RequestError("Command Failure")
              .setResponse(response)
              .setRequest(request);
          } else if (status === "inProgress" && type !== "connect") {
            await this.checkRequestPause();

            const request = new Request(url)
              .setMethod(RequestMethod.Get)
              .setUpgradeRequired(false);
            return await this.sendRequest(request);
          }

          return new RequestResult(status).setResponse(response).getResult();
        }
      }

      return new RequestResult("success").setResponse(response).getResult();
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }

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
    let requestOptions = {
      headers: {
        ...headers,
        ...request.getHeaders(),
      },
    };

    if (request.getMethod() === RequestMethod.Post) {
      requestOptions.headers = {
        ...requestOptions.headers,
        "Content-Length": request.getBody().length,
      };

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
