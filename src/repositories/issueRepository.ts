import { pool } from "../db.js";
import type { Issue, IssuePriority, IssueStatus } from "../types.js";

type IssueRow = {
  id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  created_at: Date;
  updated_at: Date;
};

export type CreateIssueInput = {
  title: string;
  description?: string | undefined;
  priority?: IssuePriority | undefined;
};

function rowToIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const { title, description, priority } = input;

  const columns: string[] = ["title"];
  const values: unknown[] = [title];

  if (description !== undefined) {
    columns.push("description");
    values.push(description);
  }
  if (priority !== undefined) {
    columns.push("priority");
    values.push(priority);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const { rows } = await pool.query<IssueRow>(
    `INSERT INTO issues (${columns.join(", ")})
     VALUES (${placeholders})
     RETURNING *`,
    values,
  );

  const row = rows[0];
  if (row === undefined) {
    throw new Error("Insert did not return a row");
  }
  return rowToIssue(row);
}

export async function findIssueById(id: number): Promise<Issue | null> {
  const { rows } = await pool.query<IssueRow>(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  const row = rows[0];
  if (row === undefined) {
    return null;
  }
  return rowToIssue(row);
}
