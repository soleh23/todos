import axios from "axios";
import { CREATE_WEB_HOOK, UPDATE_WEB_HOOK } from "./app";
import {
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateRespone,
} from "./types/todoTypes";

function toCreateRequest(createResponse: CreateResponse): CreateRequest {
  return {
    name: createResponse.item.name,
    description: createResponse.item.description || undefined,
    groupId: 0,
    done: createResponse.item.done,
    external: true,
    externalId: createResponse.item.id || undefined,
  };
}

export async function handleCreateWebhook(createResponse: CreateResponse) {
  try {
    if (CREATE_WEB_HOOK) {
      const body = toCreateRequest(createResponse);
      await axios.post(CREATE_WEB_HOOK, body);
    }
  } catch (error: any) {
    console.log("Error while handling create web hook: ", error);
  }
}

function toUpdateRequest(updateResponse: UpdateRespone): UpdateRequest {
  const items = updateResponse.items.map((todo) => ({
    id: todo.externalId || undefined, // needed to handle updates from client to external app
    externalId: todo.id || undefined, // needed to handle updates from external app to client
    done: todo.done,
  }));
  return { items };
}

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
