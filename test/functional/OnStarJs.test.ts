import dotenv from "dotenv";
dotenv.config();
import OnStar from "../../src/index";

jest.setTimeout(15000);

const { DEVICEID, VIN, ONSTAR_USERNAME, ONSTAR_PASSWORD, ONSTAR_PIN } =
  process.env;

if (!DEVICEID || !VIN || !ONSTAR_USERNAME || !ONSTAR_PASSWORD || !ONSTAR_PIN) {
  throw new Error("Missing environment config for functional tests");
}

describe("OnStarJs", () => {
  let onStar: OnStar;

  beforeAll(() => {
    onStar = OnStar.create({
      deviceId: DEVICEID,
      vin: VIN,
      username: ONSTAR_USERNAME,
      password: ONSTAR_PASSWORD,
      onStarPin: ONSTAR_PIN,
      checkRequestStatus: false,
    });
  });

  test("Unupgraded Command Successful", async () => {
    const result = await onStar.getAccountVehicles();

    expect(result.status).toEqual("success");
    expect(result.response?.data).toHaveProperty("vehicles");
  });

  test("Upgraded Command Successful", async () => {
    const result = await onStar.cancelAlert();

    expect(result.status).toEqual("success");
    expect(result.response?.data).toHaveProperty("commandResponse");
  });

  test.skip("Diagnostics Request Successful", async () => {
    jest.setTimeout(60000);

    onStar.setCheckRequestStatus(true);

    const result = await onStar.diagnostics();

    if (!result.response?.data || typeof result.response?.data === "string") {
      throw new Error("Invalid response returned");
    }

    expect(result.status).toEqual("success");
    expect(result.response?.data.commandResponse?.status).toEqual("success");
    expect(result.response?.data.commandResponse?.body).toHaveProperty(
      "diagnosticResponse",
    );
  });
});
