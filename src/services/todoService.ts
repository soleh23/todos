import {
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateRespone,
  QueryRequest,
  QueryResponse,
} from "../types/todoTypes";
import { query } from "../postgresql/pool";
import { createTodoTableQuery } from "../postgresql/createTodoTableQuery";

export default class TodoService {
  // Returns an id of created Todo
  async create(createRequest: CreateRequest): Promise<CreateResponse> {
    await query(createTodoTableQuery, []);
    return { id: "123" };
  }

  // Returns whether update was successful
  async update(updateRequest: UpdateRequest): Promise<UpdateRespone> {
    return true;
  }

  async query(queryRequest: QueryRequest): Promise<QueryResponse> {
    return { items: [] } as QueryResponse;
  }
}
