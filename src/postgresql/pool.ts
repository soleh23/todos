import { Pool } from "pg";

export const pool = new Pool({
  connectionString:
    "postgres://tqxnvggt:kbTC4TwGqHfv28ZNG5zH8sykI10P8HvD@snuffleupagus.db.elephantsql.com/tqxnvggt",
});

export async function query(text: string, params: any[]) {
  try {
    return await pool.query(text, params);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}
