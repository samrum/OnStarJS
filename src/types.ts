export interface HttpClient {
  post(url: string, data: any, config: any): Promise<RequestResponse>;
  get(url: string, config: any): Promise<RequestResponse>;
}

export interface RequestResponse {
  data?:
    | string
    | {
        commandResponse?: CommandResponse;
      };
}

export interface OnStarConfig {
  deviceId: string;
  vin: string;
  username: string;
  password: string;
  onStarPin: string;
  checkRequestStatus?: boolean;
  requestPollingIntervalSeconds?: number;
  requestPollingTimeoutSeconds?: number;
}

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  onstar_account_info: OnStarAccountInfo;
  user_info: UserInfo;
  id_token: string;
  expiration: number;
  upgraded: boolean;
}

interface OnStarAccountInfo {
  country_code: string;
  account_no: string;
}

interface UserInfo {
  RemoteUserId: string;
  country: string;
}

export enum CommandResponseStatus {
  success = "success",
  failure = "failure",
  inProgress = "inProgress",
}

export interface CommandResponse {
  body?: CommandResponseBody;
  completionTime?: string;
  requestTime: string;
  status: CommandResponseStatus;
  type: string;
  url: string;
}

export interface CommandResponseBody {
  error?: object;
  diagnosticResponse?: DiagnosticResponseItem[];
}

export interface DiagnosticResponseItem {
  name: string;
  diagnosticElement: {
    name: string;
    status: string;
    message: string;
    value?: string;
    unit?: string;
  }[];
}

export interface Result {
  status: string;
  response?: RequestResponse;
  message?: string;
}

export enum AlertRequestAction {
  Honk = "Honk",
  Flash = "Flash",
}

export enum AlertRequestOverride {
  DoorOpen = "DoorOpen",
  IgnitionOn = "IgnitionOn",
}

export interface AlertRequestOptions {
  action?: AlertRequestAction[];
  delay?: number;
  duration?: number;
  override?: AlertRequestOverride[];
}

export enum DiagnosticRequestItem {
  AmbientAirTemperature = "AMBIENT AIR TEMPERATURE",
  EngineCoolantTemp = "ENGINE COOLANT TEMP",
  EngineRpm = "ENGINE RPM",
  EvBatteryLevel = "EV BATTERY LEVEL",
  EvChargeState = "EV CHARGE STATE",
  EvEstimatedChargeEnd = "EV ESTIMATED CHARGE END",
  EvPlugState = "EV PLUG STATE",
  EvPlugVoltage = "EV PLUG VOLTAGE",
  EvScheduledChargeStart = "EV SCHEDULED CHARGE START",
  FuelTankInfo = "FUEL TANK INFO",
  GetChargeMode = "GET CHARGE MODE",
  GetCommuteSchedule = "GET COMMUTE SCHEDULE",
  HandsFreeCalling = "HANDS FREE CALLING",
  HotspotConfig = "HOTSPOT CONFIG",
  HotspotStatus = "HOTSPOT STATUS",
  IntermVoltBattVolt = "INTERM VOLT BATT VOLT",
  LastTripDistance = "LAST TRIP DISTANCE",
  LastTripFuelEconomy = "LAST TRIP FUEL ECONOMY",
  LifetimeEvOdometer = "LIFETIME EV ODOMETER",
  LifetimeFuelEcon = "LIFETIME FUEL ECON",
  LifetimeFuelUsed = "LIFETIME FUEL USED",
  Odometer = "ODOMETER",
  OilLife = "OIL LIFE",
  TirePressure = "TIRE PRESSURE",
  VehicleRange = "VEHICLE RANGE",
}

export interface DiagnosticsRequestOptions {
  diagnosticItem?: DiagnosticRequestItem[];
}

export enum ChargingProfileChargeMode {
  DefaultImmediate = "DEFAULT_IMMEDIATE",
  Immediate = "IMMEDIATE",
  DepartureBased = "DEPARTURE_BASED",
  RateBased = "RATE_BASED",
  PhevAfterMidnight = "PHEV_AFTER_MIDNIGHT",
}

export enum ChargingProfileRateType {
  Offpeak = "OFFPEAK",
  Midpeak = "MIDPEAK",
  Peak = "PEAK",
}

export interface SetChargingProfileRequestOptions {
  chargeMode?: ChargingProfileChargeMode;
  rateType?: ChargingProfileRateType;
}

export interface DoorRequestOptions {
  delay?: number;
}

export interface TrunkRequestOptions {
  delay?: number;
}

export enum ChargeOverrideMode {
  ChargeNow = "CHARGE_NOW",
  CancelOverride = "CANCEL_OVERRIDE",
}

export interface ChargeOverrideOptions {
  mode?: ChargeOverrideMode;
}
