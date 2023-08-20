import express from "express";
import TodoService, { NotFoundError } from "../services/todoService";
import {
  CreateRequestParser,
  QueryRequestParser,
  UpdateRequestParser,
} from "../types/todoTypes";
import { z } from "zod";
import { handleCreateWebhook, handleUpdateWebhook } from "../webhook";

const router = express.Router();
const todoService = new TodoService();

router.post("/query", async (req, res) => {
  try {
    const queryRequest = QueryRequestParser.parse(req.body);
    const response = await todoService.query(queryRequest);
    res.status(201).send(response);
  } catch (error: any) {
    console.log("Error while query: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    } else {
      res.status(500).send("Internal error");
    }
  }
});

router.post("/create", async (req, res) => {
  try {
    const createRequest = CreateRequestParser.parse(req.body);
    const response = await todoService.create(createRequest);
    await handleCreateWebhook(response);
    res.status(201).send(response);
  } catch (error: any) {
    console.log("Error while create: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    } else {
      res.status(500).send("Internal error");
    }
  }
});

router.post("/webhook/create", async (req, res) => {
  try {
    const createRequest = CreateRequestParser.parse(req.body);
    createRequest.external = true;
    const response = await todoService.create(createRequest);
    res.status(201).send(response);
  } catch (error: any) {
    console.log("Error while webhook create: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    } else {
      res.status(500).send("Internal error");
    }
  }
});

router.post("/update", async (req, res) => {
  try {
    const updateRequest = UpdateRequestParser.parse(req.body);
    const response = await todoService.update(updateRequest);
    // TODO: currently our app is sending all updates to the external app, we need to filter out internal updates and send only external updates
    await handleUpdateWebhook(response);
    res.status(200).send(response);
  } catch (error: any) {
    console.log("Error while update: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    } else if (error instanceof NotFoundError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Internal error");
    }
  }
});

router.post("/webhook/update", async (req, res) => {
  try {
    const updateRequest = UpdateRequestParser.parse(req.body);
    // NOTE: related to issue on line 78
    updateRequest.ignoreUnknownItems = true;
    const response = await todoService.update(updateRequest);
    res.status(200).send(response);
  } catch (error: any) {
    console.log("Error while webhook update: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    } else if (error instanceof NotFoundError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Internal error");
    }
  }
});

export default router;
