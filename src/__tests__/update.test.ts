import supertest from "supertest";
import app from "../app";
import { UpdateRespone } from "../types/todoTypes";
import { pool } from "../postgresql/pool";
import { getRandomId } from "./randomId";

const updateWebhookMocker = jest.fn().mockReturnValue({});
jest.mock("../webhooks/updateWebhook", () => {
  return {
    __esModule: true,
    handleUpdateWebhook: async (updateResponse: UpdateRespone) => {
      updateWebhookMocker(updateResponse);
    },
  };
});

describe("test update api", () => {
  afterAll(async () => {
    pool.end();
  });

  it("should throw appropriate error message on bad input - name", async () => {
    const response = await supertest(app)
      .post("/api/v1/todos/update")
      .send({
        items: [
          {
            id: "id",
          },
        ],
      });
    expect(response.statusCode).toBe(400);
    expect(response.error).toBeTruthy();
    response.error &&
      expect(response.error.text).toBe(
        "Bad input: Expected number, received string - items,0,id"
      );
  });

  // TODO: verify for all parameters

  it("should update multiple todos", async () => {
    const testGroupId = getRandomId();

    // create todos
    const response1 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name 1",
      groupId: testGroupId,
      done: false,
    });
    expect(response1.statusCode).toBe(201);

    const response2 = await supertest(app).post("/api/v1/todos/create").send({
      name: "test name 2",
      groupId: testGroupId,
      done: true,
    });
    expect(response2.statusCode).toBe(201);

    // verify their existence
    const queryResponse = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
      });
    expect(queryResponse.statusCode).toBe(200);
    expect(queryResponse.body.items.length).toBe(2);
    expect(queryResponse.body.items[0].id).toBe(response1.body.item.id);
    expect(queryResponse.body.items[1].id).toBe(response2.body.item.id);
    expect(queryResponse.body.items[0].done).toBe(false);
    expect(queryResponse.body.items[1].done).toBe(true);

    // update status of todos
    const updateResponse = await supertest(app)
      .post("/api/v1/todos/update")
      .send({
        items: [
          {
            id: response1.body.item.id,
            done: true,
          },
          {
            id: response2.body.item.id,
            done: false,
          },
        ],
      });

    // verify update
    const queryResponse2 = await supertest(app)
      .post("/api/v1/todos/query")
      .send({
        groupId: testGroupId,
      });
    expect(queryResponse2.statusCode).toBe(200);
    expect(queryResponse2.body.items.length).toBe(2);
    expect(queryResponse2.body.items[0].id).toBe(response1.body.item.id);
    expect(queryResponse2.body.items[1].id).toBe(response2.body.item.id);
    expect(queryResponse2.body.items[0].done).toBe(true);
    expect(queryResponse2.body.items[1].done).toBe(false);

    //verify webhook call
    expect(updateWebhookMocker.mock.calls).toHaveLength(1);
    expect(updateWebhookMocker.mock.calls[0][0]).toStrictEqual(
      updateResponse.body
    );
  });
  // TODO: test ignoreUnknownItems parameter
});
