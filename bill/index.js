import express from "express"
import bodyParser from "body-parser";
import {PartyService} from "./services/PartyService.js";


const app = express()
const port = 3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Serveur Bill!')
})

/**** MOCK DB ****/
const tasks = new Map()
/**** MOCK DB ****/

/**** /api/v1/actions ENDPOINTS ****/

app.get('/api/v1/actions', (req, res) => {

    console.log("requete reçu : ", req.body);
    const {metadata} = req.body;
    let response;
    if(metadata.task_id){
        const status = tasks.get(metadata.task_id)
        console.log("statut est : ",status)
        switch(status){
            case "deleted":
                 response = {
                    "metadata": metadata,
                    "data": {
                        "success" : true,
                        "status" : status
                    }
                }
                res.status(204).send(response)
                return;
            case "error":
                 response = {
                    "metadata": metadata,
                    "data": {
                        "success" : false,
                        "status" : status,
                        "errormessage" : "Problème lors de l'altération de l'image"
                    }
                }
                res.status(400).send(response)
                return;
            case "done":
                const modifiedImageInBase64 = PartyService.retrieveImage(metadata.task_id)
                 response = {
                    "metadata": metadata,
                    "data": {
                        "success" : true,
                        "status" : status,
                        "image": modifiedImageInBase64
                    }
                }
                console.log("envoyé sur done")
                res.status(201).send(response);
                return;
            case "inProgress":
                 response = {
                    "metadata": metadata,
                    "data": {
                        "success" : true,
                        "status" : status
                    }
                }
                console.log("envoyé sur inProgress")
                res.status(200).send(response)
                return;
        }

    } else {
        response = {
            "metadata": metadata,
            "data": {
                "success" : false,
                "status" : "error",
                "errormessage" : "Problème lors de l'altération de l'image"
            }
        }
        res.status(400).send(response)
    }

    res.status(200).send(JSON.stringify(tasks))
})


app.post('/api/v1/actions', (req, res) => {
    console.log("requete reçu : ", req.body);
    const {metadata, data} = req.body;
    const actionsData = PartyService.handleActionFromFrontend(metadata.party_id);
    tasks.set(actionsData.newTaskId, actionsData.status)
    const response = {
        "metadata": metadata,
        "data": {
            "success": true,
            "status": actionsData.status,
            "task_id": actionsData.newTaskId
        }
    }
    res.status(200).send(response)
})

app.post('/api/v1/actions/diego', (req, res) => {
    console.log("requete reçu : ", req.body);
    const {metadata, data} = req.body;

    // set la map avec les datas de diego

    const response = {
        "metadata": metadata,
        "data": {
            "success": true
        }
    }
    res.status(200).send(response)
})

app.post('/api/v1/actions/elise', (req, res) => {
    console.log("requete reçu : ", req.body);
    const {metadata, data} = req.body;

    // set la map avec les datas de elise

    const response = {
        "metadata": metadata,
        "data": {
            "success": true
        }
    }
    res.status(200).send(response)
})

/**** /api/v1/actions ENDPOINTS ****/

function updateStatusTasks(callback) {
    console.log("map actuelle des tasks : ", tasks)
    for (const task of tasks) {
        tasks.set(task[0],"done");
    }

}

app.listen(port, () => {
    console.log(`Server started on ${port}`)
    setInterval(updateStatusTasks, 3000);
})
