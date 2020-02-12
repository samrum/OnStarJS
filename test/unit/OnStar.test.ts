import { mock, instance } from "ts-mockito";

import OnStar from "../../src/index";
import RequestService from "../../src/RequestService";
import { testConfig } from "./testData";

let onStar: OnStar;

describe("OnStar", () => {
  beforeEach(() => {
    const requestService = mock(RequestService);

    onStar = new OnStar(instance(requestService));
  });

  test("create", () => {
    expect(OnStar.create(testConfig)).toBeInstanceOf(OnStar);
  });

  test("start", async () => {
    await onStar.start();
  });

  test("cancelStart", async () => {
    await onStar.cancelStart();
  });

  test("lockDoor", async () => {
    await onStar.lockDoor();
  });

  test("unlockDoor", async () => {
    await onStar.unlockDoor();
  });

  test("alert", async () => {
    await onStar.alert();
  });

  test("cancelAlert", async () => {
    await onStar.cancelAlert();
  });

  test("chargeOverride", async () => {
    await onStar.chargeOverride();
  });

  test("getChargingProfile", async () => {
    await onStar.getChargingProfile();
  });

  test("setChargingProfile", async () => {
    await onStar.setChargingProfile();
  });

  test("diagnostics", async () => {
    await onStar.diagnostics();
  });

  test("getAccountVehicles", async () => {
    await onStar.getAccountVehicles();
  });
});
