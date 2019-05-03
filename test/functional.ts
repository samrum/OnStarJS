import OnStar from "../src/index";
import config from "../testCredentials.json";

const onStar = OnStar.create(config);

onStar
  .lockDoor()
  .then(result => {
    console.log(`LockDoor Completed. Status: ${result.status}`);

    onStar
      .alert({
        action: ["Flash"],
      })
      .then(result => {
        console.log(`Alert Completed. Status: ${result.status}`);
      });
  })
  .catch(e => {
    console.error(e.message);

    if (e.request) {
      console.error(`Request: ${e.request.path}`);
    }

    if (e.response) {
      console.error(
        `Status: ${e.response.status},  Status Text: ${e.response.statusText}`,
      );
    }
  });
