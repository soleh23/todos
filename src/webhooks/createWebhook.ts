import axios from "axios";
import { CREATE_WEB_HOOK } from "../app";
import { CreateRequest, CreateResponse } from "../types/todoTypes";

function toCreateRequest(createResponse: CreateResponse): CreateRequest {
  return {
    name: createResponse.item.name,
    description: createResponse.item.description || undefined,
    groupId: 0, // some constant to bypass existence constraint
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
