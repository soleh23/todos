import express from "express";
import v1TodoRouter from "./v1/todoRoutes";
import livenessRoute from "./v1/livenessRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", livenessRoute);
app.use("/api/v1/todos", v1TodoRouter);
// NOTE: I decided to omit creating groups related endpoints for simplicity

app.use((error: any, req, res, next) => {
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return res.status(400).send("Invalid JSON");
  }
  next();
});

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
