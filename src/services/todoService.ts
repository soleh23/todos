import {
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateRespone,
  QueryRequest,
  QueryResponse,
  Todo,
} from "../types/todoTypes";
import { getClient, query } from "../postgresql/pool";
import { createTodoTableQuery } from "../postgresql/createTodoTableQuery";

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}
export default class TodoService {
  // Returns an id of created Todo
  async create(createRequest: CreateRequest): Promise<CreateResponse> {
    try {
      await query(createTodoTableQuery, []);

      const name = createRequest.name;
      const description = createRequest.description || null;

      // NOTE: need to make sure group id exists
      const groupId = createRequest.groupId;
      const done = createRequest.done || false;
      const timestamp = Date.now();

      const response = await query(
        `
          INSERT INTO todos (name, description, groupId, done, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        [name, description, groupId, done, timestamp, timestamp]
      );
      const id: number = response.rows[0]["id"];
      return { id };
    } catch (error: any) {
      console.log("Error on TodoService.create: ", error);
      throw error;
    }
  }

  // Returns whether the update was successful
  async update(updateRequest: UpdateRequest): Promise<UpdateRespone> {
    let client = null;
    try {
      client = await getClient();
      await client.query("BEGIN");

      for (let i = 0; i < updateRequest.items.length; i++) {
        const updateItem = updateRequest.items[i];
        const response = await client.query(
          `SELECT count(*) from todos WHERE id=$1 LIMIT 1`,
          [updateItem.id]
        );
        if (response.rows[0].count != 1) {
          throw new NotFoundError(`Id ${updateItem.id} not found`);
        }
      }

      const timestamp = Date.now();
      for (let i = 0; i < updateRequest.items.length; i++) {
        const updateItem = updateRequest.items[i];
        await client.query(
          `UPDATE todos SET done = $1, updated_at = $2 WHERE id = $3`,
          [updateItem.done, timestamp, updateItem.id]
        );
      }
      const response = await client.query("COMMIT");
      return;
    } catch (error: any) {
      console.log("Error on TodoService.create: ", error);
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async query(queryRequest: QueryRequest): Promise<QueryResponse> {
    try {
      const limit = queryRequest.limit === undefined ? 25 : queryRequest.limit;
      const cursor = queryRequest.cursor || 0;

      const values: any[] = [cursor, limit];

      let doneFilter = "";
      if (queryRequest.done !== undefined) {
        doneFilter = " AND done=$3";
        values.push(queryRequest.done);
      }

      let groupIdFilter = "";
      if (queryRequest.groupId !== undefined) {
        groupIdFilter = " AND groupId=$4";
        values.push(queryRequest.groupId);
      }

      const response = await query(
        `
          SELECT *
          FROM todos
          WHERE id>$1 ${doneFilter} ${groupIdFilter}
          ORDER BY id
          LIMIT $2
        `,
        values
      );
      const todos: Todo[] = response.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        groupId: row.group_id,
        done: row.done,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      const nextCursor =
        todos.length === 0 ? undefined : todos[todos.length - 1].id;
      return { items: todos, cursor: nextCursor };
    } catch (error: any) {
      console.log("Error on TodoService.create: ", error);
      throw error;
    }
  }
}
