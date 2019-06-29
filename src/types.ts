export interface HttpClient {
  post(url: string, data: any, config: any): Promise<any>;
  get(url: string, config: any): Promise<any>;
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

export interface RequestResponse {
  commandResponse?: CommandResponse;
}

export interface CommandResponse {
  body?: CommandResponseBody;
  completionTime?: string;
  requestTime: string;
  status: string;
  type: string;
  url: string;
}

export interface CommandResponseBody {
  error?: object;
}

export interface Result {
  status: string;
  response: ResultResponse;
  message?: string;
}

export interface ResultResponse {
  data: any;
}

type AlertAction = "Honk" | "Flash";
type AlertOverride = "DoorOpen" | "IgnitionOn";

export interface AlertRequestOptions {
  action?: AlertAction[];
  delay?: number;
  duration?: number;
  override?: AlertOverride[];
}

type DiagnosticItem =
  | "ENGINE COOLANT TEMP"
  | "ENGINE RPM"
  | "LAST TRIP FUEL ECONOMY"
  | "EV ESTIMATED CHARGE END"
  | "EV BATTERY LEVEL"
  | "OIL LIFE"
  | "EV PLUG VOLTAGE"
  | "LIFETIME FUEL ECON"
  | "HOTSPOT CONFIG"
  | "LIFETIME FUEL USED"
  | "ODOMETER"
  | "HOTSPOT STATUS"
  | "LIFETIME EV ODOMETER"
  | "EV PLUG STATE"
  | "EV CHARGE STATE"
  | "TIRE PRESSURE"
  | "AMBIENT AIR TEMPERATURE"
  | "LAST TRIP DISTANCE"
  | "INTERM VOLT BATT VOLT"
  | "GET COMMUTE SCHEDULE"
  | "GET CHARGE MODE"
  | "EV SCHEDULED CHARGE START"
  | "FUEL TANK INFO"
  | "HANDS FREE CALLING"
  | "ENERGY EFFICIENCY"
  | "VEHICLE RANGE";

export interface DiagnosticsRequestOptions {
  diagnosticItem?: DiagnosticItem[];
}

export interface SetChargingProfileRequestOptions {
  chargeMode?:
    | "DEFAULT_IMMEDIATE"
    | "IMMEDIATE"
    | "DEPARTURE_BASED"
    | "RATE_BASED"
    | "PHEV_AFTER_MIDNIGHT";
  rateType?: "OFFPEAK" | "MIDPEAK" | "PEAK";
}

export interface DoorRequestOptions {
  delay?: number;
}

export interface ChargeOverrideOptions {
  mode?: "CHARGE_NOW" | "CANCEL_OVERRIDE";
}
