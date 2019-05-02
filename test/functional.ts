import OnStar from "../src/index";
import config from "../testCredentials.json";
import RequestError from "../src/RequestError";

const onStar = OnStar.create(config);

onStar
  .lockDoor()
  .then(result => {
    console.log("Request Completed. Status:", result.status);
  })
  .catch(e => {
    if (e instanceof RequestError) {
      console.log(JSON.stringify(e));
    } else {
      console.error(e);
    }
  });
