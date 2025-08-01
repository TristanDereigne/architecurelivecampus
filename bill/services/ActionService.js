export class ActionService {
  static callApiDiegoOrElise(
    party_id,
    task_id,
    imageBase64,
    type_transformation,
    type_id,
    transformation_name
  ) {
    console.log("type_transformation : ", type_transformation);

    if (type_transformation === "filter") {
      // DIEGO
      console.log("APPEL API DIEGO POST : /api/v1/actions");
      fetch("http://localhost:3001/api/v1/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            party_id: task_id,
            task_id: party_id,
          },
          data: {
            Image: imageBase64,
            transformation: type_transformation,
            type_id: type_id,
            filter_name: transformation_name,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("data : ", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (type_transformation === "effect") {
      // ELISE
      console.log("APPEL API ELISE POST : /api/v1/actions");
      fetch("http://localhost:3002/api/v1/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            party_id: task_id,
            task_id: party_id,
          },
          data: {
            Image: imageBase64,
            transformation: type_transformation,
            type_id: type_id,
            direction: transformation_name,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("data : ", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      return null;
    }
  }
}
