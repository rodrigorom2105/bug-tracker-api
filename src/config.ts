import { z } from "zod";
import "dotenv/config";

const postgresProtocol = /^postgres(ql)?$/;

const schema = z.object({
  DATABASE_URL: z.url({ protocol: postgresProtocol }),
  TEST_DATABASE_URL: z.url({ protocol: postgresProtocol }),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Missing or invalid env variables");
  for (const issue of parsed.error.issues) {
    console.error(` ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
