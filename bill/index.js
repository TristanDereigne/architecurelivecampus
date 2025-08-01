import express from "express";
import bodyParser from "body-parser";
import { PartyService } from "./services/PartyService.js";
import { ActionService } from "./services/ActionService.js";
import { IMAGE_BASE64 } from "./image.js";

const app = express();
const port = 3000;

// IMAGE MOCK EXEMPLE

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Serveur Bill!");
});

/**** MOCK DB ****/
const tasks = new Map();
const taskImage = new Map(); // On stocke task_id et image
/**** MOCK DB ****/

/**** /api/v1/actions ENDPOINTS ****/

app.get("/api/v1/actions", (req, res) => {
  console.log("requete reçu : ", req.body);
  const { metadata } = req.body;
  let response;
  if (metadata.task_id) {
    // const status = tasks.get(metadata.task_id);
    const status = tasks
      .get(metadata.party_id + "," + metadata.task_id)
      .split(",")[0];

    if (!status)
      return res.status(404).json({
        metadata: metadata,
        data: {
          success: false,
          errorMessage: "Task id not found",
        },
      });
    console.log("statut est : ", status);
    switch (status) {
      case "deleted":
        response = {
          metadata: metadata,
          data: {
            success: true,
            status: status,
          },
        };
        res.status(204).send(response);
        return;
      case "error":
        response = {
          metadata: metadata,
          data: {
            success: false,
            status: status,
            errormessage: "Problème lors de l'altération de l'image",
          },
        };
        res.status(400).send(response);
        return;
      case "done":
        response = {
          metadata: metadata,
          data: {
            success: true,
            status: status,
            image: taskImage.get(metadata.task_id),
          },
        };
        console.log("envoyé sur done");
        res.status(201).send(response);
        return;
      case "inProgress":
        response = {
          metadata: metadata,
          data: {
            success: true,
            status: status,
          },
        };
        console.log("envoyé sur inProgress");
        res.status(200).send(response);
        return;
    }
  } else {
    response = {
      metadata: metadata,
      data: {
        success: false,
        status: "error",
        errormessage: "Problème lors de l'altération de l'image",
      },
    };
    res.status(400).send(response);
  }

  res.status(200).send(JSON.stringify(tasks));
});

app.post("/api/v1/actions", (req, res) => {
  console.log("requete reçu : ", req.body);
  const { metadata, data } = req.body;
  const actionsData = PartyService.handleActionFromFrontend(metadata.party_id);
  if (data.transformation == "filter") {
    tasks.set(
      metadata.party_id + "," + actionsData.newTaskId,
      actionsData.status +
        "," +
        data.transformation +
        "," +
        data.type_id +
        "," +
        data.filter_name
    );
  } else if (data.transformation == "effect") {
    tasks.set(
      metadata.party_id + "," + actionsData.newTaskId,
      actionsData.status +
        "," +
        data.transformation +
        "," +
        data.type_id +
        "," +
        data.direction
    );
  }

  const response = {
    metadata: metadata,
    data: {
      success: true,
      status: actionsData.status,
      task_id: actionsData.newTaskId,
    },
  };
  res.status(200).send(response);
});

app.post("/api/v1/actions/diego", (req, res) => {
  console.log("requete reçu : ", req.body);
  const { metadata, data } = req.body;

  // set la map avec les datas de diego
  taskImage.set(metadata.task_id, data.image);
  tasks.set(metadata.party_id + "," + metadata.task_id, "done");

  const response = {
    metadata: metadata,
    data: {
      success: true,
    },
  };
  res.status(200).send(JSON.stringify(response));
});

app.post("/api/v1/actions/elise", (req, res) => {
  console.log("requete reçu DE elise : ", req.body);
  const { metadata, data } = req.body;

  // set la map avec les datas de elise
  taskImage.set(metadata.task_id, data.image);
  tasks.set(metadata.party_id + "," + metadata.task_id, "done");

  const response = {
    metadata: metadata,
    data: {
      success: true,
    },
  };
  res.status(200).send(JSON.stringify(response));
});

/**** /api/v1/actions ENDPOINTS ****/

function updateStatusTasks(callback) {
  console.log("map actuelle des tasks : ", tasks);
  console.log("map actuelle des taskImage : ", taskImage);

  for (const task of tasks) {
    // tasks.set(task[0], "done");

    const task_status = tasks.get(task[0]).split(",")[0];

    console.log("STATUS TASK : ", task_status);

    if (task_status === "inProgress") {
      console.log("TRAITEMENT TASK EN COURS : ", task);

      const [task_id, party_id] = task[0].split(",");
      const [status, type_transformation, type_id, transformation_name] =
        task[1].split(",");

      const response = ActionService.callApiDiegoOrElise(
        party_id,
        task_id,
        IMAGE_BASE64,
        type_transformation,
        type_id,
        transformation_name
      );

      break;
    }
  }

  //  const firstEntry = tasks.entries().next().value;

  //   console.log("task first : ", task_first);

  // ActionService.callApiDiegoOrElise()
}

app.listen(port, () => {
  console.log(`Server started on ${port}`);
  setInterval(updateStatusTasks, 3000);
});
