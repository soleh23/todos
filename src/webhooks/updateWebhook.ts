import axios from "axios";
import { UPDATE_WEB_HOOK } from "../app";
import { UpdateRequest, UpdateRespone } from "../types/todoTypes";

function toUpdateRequest(updateResponse: UpdateRespone): UpdateRequest {
  const items = updateResponse.items.map((todo) => ({
    id: todo.externalId || undefined, // needed to handle updates from client to external app
    externalId: todo.id || undefined, // needed to handle updates from external app to client
    done: todo.done,
  }));
  return { items };
}

// NOTE: this is a bit ugly because it handles bi-directional updates.
// In reality this would be 2 separate servers, thus the logic would be simpler as well.
export async function handleUpdateWebhook(updateResponse: UpdateRespone) {
  try {
    if (UPDATE_WEB_HOOK) {
      const body = toUpdateRequest(updateResponse);
      await axios.post(UPDATE_WEB_HOOK, body);
    }
  } catch (error: any) {
    console.log("Error while handling update web hook: ", error);
  }
}
