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

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

export default class TodoService {
  private toTodo(row: any): Todo {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      groupId: row.group_id,
      done: row.done,
      external: row.external,
      externalId: row.external_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(createRequest: CreateRequest): Promise<CreateResponse> {
    try {
      const name = createRequest.name;
      const description = createRequest.description || null;

      // NOTE: need to make sure group id exists
      const groupId = createRequest.groupId;
      const done = createRequest.done || false;
      const external = createRequest.external || false;
      const externalId = createRequest.externalId || null;
      const timestamp = Date.now();

      const response = await query(
        `
          INSERT INTO todos (name, description, group_id, done, external, external_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `,
        [
          name,
          description,
          groupId,
          done,
          external,
          externalId,
          timestamp,
          timestamp,
        ]
      );
      if (response.rows.length !== 1) {
        throw Error("Unexpected number of rows returned while creating");
      }
      const item = this.toTodo(response.rows[0]);
      return { item };
    } catch (error: any) {
      console.log("Error on TodoService.create: ", error);
      throw error;
    }
  }

  async update(updateRequest: UpdateRequest): Promise<UpdateRespone> {
    let client = null;
    try {
      client = await getClient();
      await client.query("BEGIN");

      if (updateRequest.ignoreUnknownItems === false) {
        for (let i = 0; i < updateRequest.items.length; i++) {
          const updateItem = updateRequest.items[i];
          const response = await client.query(
            `SELECT count(*) from todos WHERE id=$1 OR external_id=$2 LIMIT 1`,
            [updateItem.id, updateItem.externalId]
          );
          if (response.rows[0].count != 1) {
            throw new NotFoundError(`Id ${updateItem.id} not found`);
          }
        }
      }

      const timestamp = Date.now();
      const updatedTodos: Todo[] = [];
      for (let i = 0; i < updateRequest.items.length; i++) {
        const updatedItem = updateRequest.items[i];
        const response = await client.query(
          `UPDATE todos SET done=$1, updated_at=$2 WHERE id=$3 OR external_id=$4 RETURNING *`,
          [updatedItem.done, timestamp, updatedItem.id, updatedItem.externalId]
        );
        if (response.rows.length > 0) {
          updatedTodos.push(this.toTodo(response.rows[0]));
        }
      }

      await client.query("COMMIT");
      return { items: updatedTodos };
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
        const valuesIndex = values.length;
        groupIdFilter = ` AND group_id=$${valuesIndex + 1}`;
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
      const todos: Todo[] = response.rows.map(this.toTodo);
      const nextCursor =
        todos.length === 0 || todos.length < limit
          ? undefined
          : todos[todos.length - 1].id;
      return { items: todos, cursor: nextCursor };
    } catch (error: any) {
      console.log("Error on TodoService.create: ", error);
      throw error;
    }
  }
}
