import supertest from "supertest";
import app from "../app";
import { pool } from "../postgresql/pool";
import { getRandomId } from "./randomId";

describe("test query api", () => {
  afterAll(async () => {
    pool.end();
  });

  it("should throw appropriate error message on bad input - limit", async () => {
    const response = await supertest(app).post("/api/v1/todos/query").send({
      limit: "123",
    });
    expect(response.statusCode).toBe(400);
    expect(response.error).toBeTruthy();
    response.error &&
      expect(response.error.text).toBe(
        "Bad input: Expected number, received string - limit"
      );
  });

  // TODO: verify for all parameters

  it("should query by 'done'", async () => {
    const testGroupId = getRandomId();
    const response1 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: false,
      description: "description",
    });
    const response2 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: false,
      description: "description",
    });
    const response3 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: true,
      description: "description",
    });

    const queryResponse1 = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
        done: true,
      });
    expect(queryResponse1.statusCode).toBe(200);
    expect(queryResponse1.body.items.length).toBe(1);
    expect(queryResponse1.body.items[0].id).toBe(response3.body.item.id);

    const queryResponse2 = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
        done: false,
      });
    expect(queryResponse2.statusCode).toBe(200);
    expect(queryResponse2.body.items.length).toBe(2);
    expect(queryResponse2.body.items[0].id).toBe(response1.body.item.id);
    expect(queryResponse2.body.items[1].id).toBe(response2.body.item.id);
  });

  it("should query by all parameters", async () => {
    const testGroupId = getRandomId();
    const response1 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: false,
      description: "description",
    });
    const response2 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: true,
      description: "description",
    });
    const response3 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name",
      groupId: testGroupId,
      done: true,
      description: "description",
    });

    const queryResponse1 = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
        limit: 1,
        done: true,
      });
    expect(queryResponse1.statusCode).toBe(200);
    expect(queryResponse1.body.items.length).toBe(1);
    expect(queryResponse1.body.items[0].id).toBe(response2.body.item.id);
    expect(queryResponse1.body.cursor).toBe(response2.body.item.id);

    const queryResponse2 = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
        limit: 2,
        done: true,
        cursor: queryResponse1.body.cursor,
      });
    expect(queryResponse2.statusCode).toBe(200);
    expect(queryResponse2.body.items.length).toBe(1);
    expect(queryResponse2.body.items[0].id).toBe(response3.body.item.id);
    expect(queryResponse2.body.cursor).toBeUndefined();
  });
});
