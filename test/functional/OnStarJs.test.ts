import dotenv from "dotenv";
dotenv.config();
import OnStar from "../../src/index";

jest.setTimeout(15000);

const { DEVICEID, VIN, USERNAME, PASSWORD, ONSTARPIN } = process.env;

if (!DEVICEID || !VIN || !USERNAME || !PASSWORD || !ONSTARPIN) {
  throw new Error("Missing environment config for functional tests");
}

describe("OnStarJs", () => {
  let onStar: OnStar;

  beforeAll(() => {
    onStar = OnStar.create({
      deviceId: DEVICEID,
      vin: VIN,
      username: USERNAME,
      password: PASSWORD,
      onStarPin: ONSTARPIN,
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
});
