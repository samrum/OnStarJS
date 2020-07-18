import dotenv from "dotenv";
dotenv.config();
import OnStar from "../../src/index";

jest.setTimeout(15000);

let onStar: OnStar;

describe("OnStarJs", () => {
  beforeAll(() => {
    const { DEVICEID, VIN, USERNAME, PASSWORD, ONSTARPIN } = process.env;

    if (!DEVICEID || !VIN || !USERNAME || !PASSWORD || !ONSTARPIN) {
      throw new Error("Missing environment config for functional tests");
    }

    onStar = OnStar.create({
      deviceId: DEVICEID,
      vin: VIN,
      username: USERNAME,
      password: PASSWORD,
      onStarPin: ONSTARPIN,
      checkRequestStatus: false,
    });
  });

  test("Account Info", async () => {
    const result = await onStar.getAccountVehicles();

    expect(result.status).toEqual("success");
    expect(result.response?.data).toHaveProperty("vehicles");
  });

  test("Lock Door", async () => {
    const result = await onStar.lockDoor();

    expect(result.status).toEqual("success");
    expect(result.response?.data).toHaveProperty("commandResponse");
  });
});
