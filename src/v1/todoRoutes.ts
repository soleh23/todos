import express from "express";
import TodoService from "../services/todoService";
import {
  CreateRequestParser,
  QueryRequestParser,
  UpdateRequestParser,
} from "../types/todoTypes";
import { z } from "zod";

const router = express.Router();
const todoService = new TodoService();

router.post("/query", (req, res) => {
  try {
    const queryRequest = QueryRequestParser.parse(req.body);
    console.log({ queryRequest });
    res.status(200).send({ status: "OK" });
  } catch (error: any) {
    console.log("Error while query: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    }
    res.status(500).send("Internal error");
  }
});

router.post("/create", (req, res) => {
  try {
    const createRequest = CreateRequestParser.parse(req.body);
    console.log({ createRequest });
    res.send("add");
  } catch (error: any) {
    console.log("Error while query: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    }
    res.status(500).send("Internal error");
  }
});

router.post("/update", (req, res) => {
  try {
    const updateRequest = UpdateRequestParser.parse(req.body);
    console.log({ updateRequest });
    res.send("delete");
  } catch (error: any) {
    console.log("Error while query: ", error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .send(
          `Bad input: ${error.issues[0].message} - ${error.issues[0].path}`
        );
    }
    res.status(500).send("Internal error");
  }
});

export default router;
