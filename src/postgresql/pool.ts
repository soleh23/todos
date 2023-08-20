import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const CONNECTION_STRING = process.env.CONNECTION_STRING as string;

export const pool = new Pool({
  connectionString: CONNECTION_STRING,
});

export async function query(text: string, params: any[]) {
  try {
    return await pool.query(text, params);
  } catch (error: any) {
    console.log("Error while executing a query", error);
    throw error;
  }
}

export async function getClient() {
  try {
    return await pool.connect();
  } catch (error: any) {
    console.log("Error while fetching a PG client", error);
    throw error;
  }
}
