import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { config } from "../src/config.js";

const { Client } = pg;

async function migrate(): Promise<void> {
  const useTest = process.argv.includes("--test");
  const connectionString = useTest
    ? config.TEST_DATABASE_URL
    : config.DATABASE_URL;
  console.log(`Migrating ${useTest ? "TEST" : "DEV"} database`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    `);
    const { rows } = await client.query<{ filename: string }>(
      "SELECT filename FROM _migrations",
    );
    const applied = new Set(rows.map((row) => row.filename));
    const migrationsDir = path.resolve(import.meta.dirname, "../migrations");
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort(); // text sort: works because filenames are zero-padded (001, 002...)

    let appliedCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip   ${file}`);
        continue;
      }
      const sql = await readFile(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        appliedCount++;
        console.log(`  apply  ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`  failed ${file}`);
        throw error; // stop here: later migrations may depend on this one
      }

      console.log(
        appliedCount === 0
          ? "Nothing to apply"
          : `Applied ${appliedCount} migration(s)`,
      );
    }
  } finally {
    client.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed: ", err);
  process.exit(1);
});
