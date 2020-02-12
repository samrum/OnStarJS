import dotenv from "dotenv";
dotenv.config();
import OnStar from "../../src/index";

jest.setTimeout(15000);

let onStar: OnStar;

describe("OnStarJs", () => {
  beforeAll(() => {
    onStar = OnStar.create({
      deviceId: process.env.DEVICEID || "",
      vin: process.env.VIN || "",
      username: process.env.USERNAME || "",
      password: process.env.PASSWORD || "",
      onStarPin: process.env.ONSTARPIN || "",
      checkRequestStatus: false,
    });
  });

  test("Account Info", async () => {
    const result = await onStar.getAccountVehicles();

    expect(result.status).toEqual("success");
    expect(result.response.data).toHaveProperty("vehicles");
  });

  test("Lock Door", async () => {
    const result = await onStar.lockDoor();

    expect(result.status).toEqual("success");
    expect(result.response.data).toHaveProperty("commandResponse");
  });
});
