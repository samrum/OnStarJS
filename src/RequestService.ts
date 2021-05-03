import TokenHandler from "./TokenHandler";
import Request, { RequestMethod } from "./Request";
import RequestResult from "./RequestResult";
import RequestError from "./RequestError";
import {
  AlertRequestAction,
  AlertRequestOptions,
  AlertRequestOverride,
  ChargeOverrideMode,
  ChargeOverrideOptions,
  ChargingProfileChargeMode,
  ChargingProfileRateType,
  DiagnosticRequestItem,
  DiagnosticsRequestOptions,
  DoorRequestOptions,
  HttpClient,
  OAuthToken,
  OnStarConfig,
  RequestResponse,
  Result,
  SetChargingProfileRequestOptions,
  CommandResponseStatus,
} from "./types";
import onStarAppConfig from "./onStarAppConfig.json";

enum OnStarApiCommand {
  Alert = "alert",
  CancelAlert = "cancelAlert",
  CancelStart = "cancelStart",
  ChargeOverride = "chargeOverride",
  Connect = "connect",
  Diagnostics = "diagnostics",
  GetChargingProfile = "getChargingProfile",
  LockDoor = "lockDoor",
  SetChargingProfile = "setChargingProfile",
  Start = "start",
  UnlockDoor = "unlockDoor",
}

class RequestService {
  private config: OnStarConfig;
  private authToken?: OAuthToken;
  private checkRequestTimeout = 6000;
  private checkRequestStatus: boolean;
  private tokenRefreshPromise?: Promise<OAuthToken>;
  private tokenUpgradePromise?: Promise<void>;

  constructor(
    config: OnStarConfig,
    private tokenHandler: TokenHandler,
    private client: HttpClient,
  ) {
    this.config = {
      ...config,
      vin: config.vin.toUpperCase(),
    };

    this.checkRequestStatus = this.config.checkRequestStatus ?? true;
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

  setCheckRequestStatus(checkStatus: boolean) {
    this.checkRequestStatus = checkStatus;

    return this;
  }

  async start(): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.Start);

    return this.sendRequest(request);
  }

  async cancelStart(): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.CancelStart);

    return this.sendRequest(request);
  }

  async lockDoor(options: DoorRequestOptions = {}): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.LockDoor).setBody({
      lockDoorRequest: {
        delay: 0,
        ...options,
      },
    });

    return this.sendRequest(request);
  }

  async unlockDoor(options: DoorRequestOptions = {}): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.UnlockDoor).setBody(
      {
        unlockDoorRequest: {
          delay: 0,
          ...options,
        },
      },
    );

    return this.sendRequest(request);
  }

  async alert(options: AlertRequestOptions = {}): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.Alert).setBody({
      alertRequest: {
        action: [AlertRequestAction.Honk, AlertRequestAction.Flash],
        delay: 0,
        duration: 1,
        override: [
          AlertRequestOverride.DoorOpen,
          AlertRequestOverride.IgnitionOn,
        ],
        ...options,
      },
    });

    return this.sendRequest(request);
  }

  async cancelAlert(): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.CancelAlert);

    return this.sendRequest(request);
  }

  async chargeOverride(options: ChargeOverrideOptions = {}): Promise<Result> {
    const request = this.getCommandRequest(
      OnStarApiCommand.ChargeOverride,
    ).setBody({
      chargeOverrideRequest: {
        mode: ChargeOverrideMode.ChargeNow,
        ...options,
      },
    });

    return this.sendRequest(request);
  }

  async getChargingProfile(): Promise<Result> {
    const request = this.getCommandRequest(OnStarApiCommand.GetChargingProfile);

    return this.sendRequest(request);
  }

  async setChargingProfile(
    options: SetChargingProfileRequestOptions = {},
  ): Promise<Result> {
    const request = this.getCommandRequest(
      OnStarApiCommand.SetChargingProfile,
    ).setBody({
      chargingProfile: {
        chargeMode: ChargingProfileChargeMode.Immediate,
        rateType: ChargingProfileRateType.Midpeak,
        ...options,
      },
    });

    return this.sendRequest(request);
  }

  async diagnostics(options: DiagnosticsRequestOptions = {}): Promise<Result> {
    const request = this.getCommandRequest(
      OnStarApiCommand.Diagnostics,
    ).setBody({
      diagnosticsRequest: {
        diagnosticItem: [
          DiagnosticRequestItem.Odometer,
          DiagnosticRequestItem.TirePressure,
          DiagnosticRequestItem.AmbientAirTemperature,
          DiagnosticRequestItem.LastTripDistance,
        ],
        ...options,
      },
    });

    return this.sendRequest(request);
  }

  async getAccountVehicles(): Promise<Result> {
    const request = new Request(
      `${this.getApiUrlForPath(
        "/account/vehicles",
      )}?includeCommands=true&includeEntit%20lements=true&includeModules=true`,
    )
      .setUpgradeRequired(false)
      .setMethod(RequestMethod.Get);

    return this.sendRequest(request);
  }

  private getCommandRequest(command: OnStarApiCommand): Request {
    return new Request(this.getCommandUrl(command));
  }

  private getApiUrlForPath(path: string): string {
    return `${onStarAppConfig.serviceUrl}/v1${path}`;
  }

  private getCommandUrl(command: string): string {
    return this.getApiUrlForPath(
      `/account/vehicles/${this.config.vin}/commands/${command}`,
    );
  }

  private async getHeaders(request: Request): Promise<any> {
    const headers: any = {
      Accept: "application/json",
      "Accept-Language": "en-US",
      "Content-Type": request.getContentType(),
      Host: "api.gm.com",
      Connection: "keep-alive",
      "Accept-Encoding": "br, gzip, deflate",
      "User-Agent": onStarAppConfig.userAgent,
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
    const request = this.getCommandRequest(
      OnStarApiCommand.Connect,
    ).setUpgradeRequired(false);

    return this.sendRequest(request);
  }

  private async upgradeRequest(): Promise<Result> {
    const jwt = this.tokenHandler.createUpgradeJWT();

    const request = new Request(this.getApiUrlForPath("/oauth/token/upgrade"))
      .setContentType("text/plain")
      .setUpgradeRequired(false)
      .setBody(jwt);

    return this.sendRequest(request);
  }

  private async authTokenRequest(jwt: string): Promise<Result> {
    const request = new Request(this.getApiUrlForPath("/oauth/token"))
      .setContentType("text/plain")
      .setAuthRequired(false)
      .setBody(jwt)
      .setHeaders({
        "Accept-Language": "en",
        "User-Agent": onStarAppConfig.userAgent,
      });

    return this.sendRequest(request);
  }

  private async getAuthToken(): Promise<OAuthToken> {
    if (!this.authToken || !TokenHandler.authTokenIsValid(this.authToken)) {
      this.authToken = await this.refreshAuthToken();
    }

    return this.authToken;
  }

  private async refreshAuthToken(): Promise<OAuthToken> {
    if (!this.tokenRefreshPromise) {
      this.tokenRefreshPromise = new Promise(async (resolve, reject) => {
        try {
          const token = await this.createNewAuthToken();

          resolve(token);
        } catch (e) {
          reject(e);
        }

        this.tokenRefreshPromise = undefined;
      });
    }

    return this.tokenRefreshPromise;
  }

  private async createNewAuthToken(): Promise<OAuthToken> {
    const jwt = this.tokenHandler.createAuthJWT();

    const { response } = await this.authTokenRequest(jwt);

    if (typeof response?.data !== "string") {
      throw new Error("Failed to fetch token");
    }

    return this.tokenHandler.decodeAuthRequestResponse(response.data);
  }

  private async connectAndUpgradeAuthToken(): Promise<void> {
    if (!this.tokenUpgradePromise) {
      this.tokenUpgradePromise = new Promise(async (resolve, reject) => {
        if (!this.authToken) {
          return reject("Missing auth token");
        }

        try {
          await this.connectRequest();
          await this.upgradeRequest();

          this.authToken.upgraded = true;
          resolve();
        } catch (e) {
          reject(e);
        }

        this.tokenUpgradePromise = undefined;
      });
    }

    return this.tokenUpgradePromise;
  }

  private async sendRequest(request: Request): Promise<Result> {
    try {
      const response = await this.makeClientRequest(request);
      const { data } = response;

      const checkRequestStatus =
        request.getCheckRequestStatus() ?? this.checkRequestStatus;

      if (checkRequestStatus && typeof data === "object") {
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

          if (status === CommandResponseStatus.failure) {
            throw new RequestError("Command Failure")
              .setResponse(response)
              .setRequest(request);
          } else if (
            status === CommandResponseStatus.inProgress &&
            type !== "connect"
          ) {
            await this.checkRequestPause();

            const request = new Request(url)
              .setMethod(RequestMethod.Get)
              .setUpgradeRequired(false)
              .setCheckRequestStatus(checkRequestStatus);
            return this.sendRequest(request);
          }

          return new RequestResult(status).setResponse(response).getResult();
        }
      }

      return new RequestResult(CommandResponseStatus.success)
        .setResponse(response)
        .getResult();
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }

      let errorObj = new RequestError();

      if (error.response) {
        errorObj.message = `Request Failed with status ${error.response.status} - ${error.response.statusText}`;
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

  private async makeClientRequest(request: Request): Promise<RequestResponse> {
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

      return this.client.post(
        request.getUrl(),
        request.getBody(),
        requestOptions,
      );
    } else {
      return this.client.get(request.getUrl(), requestOptions);
    }
  }

  private checkRequestPause() {
    return new Promise((resolve) =>
      setTimeout(resolve, this.checkRequestTimeout),
    );
  }
}

export default RequestService;
