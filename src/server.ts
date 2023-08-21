import app from "./app";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const PORT = parseInt(process.env.PORT);

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
