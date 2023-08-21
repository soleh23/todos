import supertest from "supertest";
import app from "../app";
import { pool } from "../postgresql/pool";
import { getRandomId } from "./randomId";

describe("test create api", () => {
  afterAll(async () => {
    pool.end();
  });

  it("should throw appropriate error message on bad input - name", async () => {
    const response = await supertest(app).post("/api/v1/todos/create").send({
      name: 123,
    });
    expect(response.statusCode).toBe(400);
    expect(response.error).toBeTruthy();
    response.error &&
      expect(response.error.text).toBe(
        "Bad input: Expected string, received number - name"
      );
  });

  // TODO: verify for all parameters

  it("should create one todo", async () => {
    const testGroupId = getRandomId();
    const response = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: false,
      description: "description",
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.item.name).toBe("test name");
    expect(response.body.item.groupId).toBe(testGroupId);
    expect(response.body.item.done).toBe(false);
    expect(response.body.item.description).toBe("description");

    const queryResponse = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
      });
    expect(queryResponse.statusCode).toBe(200);
    expect(queryResponse.body.items.length).toBe(1);
    expect(queryResponse.body.items[0].id).toBe(response.body.item.id);
  });
});
