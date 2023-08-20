import express from "express";
import v1TodoRouter from "./v1/todoRoutes";
import livenessRoute from "./v1/livenessRoute";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const PORT = parseInt(process.env.PORT);
export const CREATE_WEB_HOOK = process.env.CREATE_WEB_HOOK;
export const UPDATE_WEB_HOOK = process.env.UPDATE_WEB_HOOK;

app.use(express.json());

app.use("/", livenessRoute);
app.use("/api/v1/todos", v1TodoRouter);
// NOTE: I decided to omit creating groups related endpoints for simplicity

// handle invalid json inputs
app.use((error: any, req, res, next) => {
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return res.status(400).send("Invalid JSON");
  }
  next();
});

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
