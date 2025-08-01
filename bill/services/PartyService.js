import { v4 as uuidv4 } from "uuid";

export class PartyService {
  static handleActionFromFrontend = (party_id) => {
    const status = "inProgress"; // retour de call creation db
    const newTaskId = uuidv4(); // call to save in db
    console.log("Nouvelle action prise en charge : ", newTaskId, " ", status);
    return {
      newTaskId,
      status,
    };
  };
}
