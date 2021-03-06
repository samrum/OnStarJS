import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import { OAuthToken, OnStarConfig } from "./types";
import onStarAppConfig from "./onStarAppConfig.json";

class TokenHandler {
  constructor(private config: OnStarConfig) {}

  static authTokenIsValid(authToken: OAuthToken): boolean {
    return authToken.expiration > Date.now() + 5 * 60 * 1000;
  }

  createUpgradeJWT(): string {
    const payload = {
      client_id: onStarAppConfig.appId,
      credential: this.config.onStarPin,
      credential_type: "PIN",
      device_id: this.config.deviceId,
      grant_type: "password",
      nonce: this.generateNonce(),
      timestamp: this.generateTimestamp(),
    };

    return jwt.sign(payload, onStarAppConfig.appSecret, { noTimestamp: true });
  }

  createAuthJWT(): string {
    const payload = {
      client_id: onStarAppConfig.appId,
      device_id: this.config.deviceId,
      grant_type: "password",
      nonce: this.generateNonce(),
      password: this.config.password,
      scope: onStarAppConfig.requiredClientScope,
      timestamp: this.generateTimestamp(),
      username: this.config.username,
    };

    return jwt.sign(payload, onStarAppConfig.appSecret, { noTimestamp: true });
  }

  decodeAuthRequestResponse(encodedToken: string): OAuthToken {
    const authToken = this.decodeToken(encodedToken);
    authToken.expiration = Date.now() + authToken.expires_in * 1000;

    return authToken;
  }

  private decodeToken(token: string): OAuthToken {
    const authToken = jwt.verify(
      token,
      onStarAppConfig.appSecret,
    ) as OAuthToken;

    authToken.expiration = 0;
    authToken.upgraded = false;

    return authToken;
  }

  private generateTimestamp(): string {
    const date = new Date();
    date.setMilliseconds(1);

    return date.toISOString();
  }

  private generateNonce(): string {
    const uuidHex = Buffer.from(uuidv4(), "utf8").toString("hex");

    const shaHex = crypto.createHash("sha256").update(uuidHex).digest("hex");

    // base32 was used in gm-onstar-probe
    return Buffer.from(shaHex).toString("base64").substring(0, 26);
  }
}

export default TokenHandler;
