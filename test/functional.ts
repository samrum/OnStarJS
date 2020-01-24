import OnStar from "../src/index";
import config from "../testCredentials.json";

const onStar = OnStar.create(config);

(async () => {
  try {
    let result;

    result = await onStar.getAccountVehicles();
    console.log(`Account Info Completed. Status: ${result.status}`);

    if (result.status === "success") {
      console.log(
        `Account Info Response`,
        JSON.stringify(result.response.data),
      );
    }

    result = await onStar.lockDoor();
    console.log(`LockDoor Completed. Status: ${result.status}`);

    result = await onStar.alert({
      action: ["Flash"],
    });
    console.log(`Alert Completed. Status: ${result.status}`);

    result = await onStar.diagnostics();
    console.log(`Diagnostics Completed. Status: ${result.status}`);

    if (result.status === "success") {
      console.log(
        `Diagnostics Result Response`,
        JSON.stringify(result.response.data),
      );
    }
  } catch (e) {
    console.error("Functional Test Error", e.message);

    if (e.request) {
      console.error(`Request: ${e.request.path}`);
    }

    if (e.response) {
      console.error(
        `Status: ${e.response.status},  Status Text: ${
          e.response.statusText
        }, Data: ${JSON.stringify(e.response.data)}`,
      );
    }
  }
})();
