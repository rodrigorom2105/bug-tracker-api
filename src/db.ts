import pg from "pg";
import { config } from "./config.js";

const connectionString =
  config.NODE_ENV === "test" ? config.TEST_DATABASE_URL : config.DATABASE_URL;

const { Pool } = pg;
export const pool = new Pool({ connectionString });

pool.on("error", (error) => {
  console.error("Error in pool connection to database: ", error);
});
