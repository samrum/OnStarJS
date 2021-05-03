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
  EngineCoolantTemp = "ENGINE COOLANT TEMP",
  EngineRpm = "ENGINE RPM",
  LastTripFuelEconomy = "LAST TRIP FUEL ECONOMY",
  EvEstimatedChargeEnd = "EV ESTIMATED CHARGE END",
  EvBatteryLevel = "EV BATTERY LEVEL",
  OilLife = "OIL LIFE",
  EvPlugVoltage = "EV PLUG VOLTAGE",
  LifetimeFuelEcon = "LIFETIME FUEL ECON",
  HotspotConfig = "HOTSPOT CONFIG",
  LifetimeFuelUsed = "LIFETIME FUEL USED",
  Odometer = "ODOMETER",
  HotspotStatus = "HOTSPOT STATUS",
  LifetimeEvOdometer = "LIFETIME EV ODOMETER",
  EvPlugState = "EV PLUG STATE",
  EvChargeState = "EV CHARGE STATE",
  TirePressure = "TIRE PRESSURE",
  AmbientAirTemperature = "AMBIENT AIR TEMPERATURE",
  LastTripDistance = "LAST TRIP DISTANCE",
  IntermVoltBattVolt = "INTERM VOLT BATT VOLT",
  GetCommuteSchedule = "GET COMMUTE SCHEDULE",
  GetChargeMode = "GET CHARGE MODE",
  EvScheduledChargeStart = "EV SCHEDULED CHARGE START",
  FuelTankInfo = "FUEL TANK INFO",
  HandsFreeCalling = "HANDS FREE CALLING",
  EnergyEfficiency = "ENERGY EFFICIENCY",
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

export enum ChargeOverrideMode {
  ChargeNow = "CHARGE_NOW",
  CancelOverride = "CANCEL_OVERRIDE",
}

export interface ChargeOverrideOptions {
  mode?: ChargeOverrideMode;
}
