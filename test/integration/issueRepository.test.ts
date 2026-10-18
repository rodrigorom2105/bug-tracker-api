import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { pool } from "../../src/db.js";
import {
  createIssue,
  findIssueById,
} from "../../src/repositories/issueRepository.js";

beforeEach(async () => {
  await pool.query("TRUNCATE issues RESTART IDENTITY");
});

afterAll(async () => {
  await pool.end();
});

describe("createIssue tests", () => {
  it("creates an issue with default status, priority and description", async () => {
    const issue = await createIssue({ title: "Login button broken" });

    expect(issue.title).toBe("Login button broken");
    expect(issue.status).toBe("open");
    expect(issue.priority).toBe("medium");
    expect(issue.description).toBeNull();
  });

  it("creates an issue with provided description and priority", async () => {
    const issueDescription =
      "After inserting username and password and clicking submit, nothing happens";
    const issue = await createIssue({
      title: "Login button broken",
      description: issueDescription,
      priority: "high",
    });

    expect(issue.title).toBe("Login button broken");
    expect(issue.status).toBe("open");
    expect(issue.priority).toBe("high");
    expect(issue.description).toBe(issueDescription);
  });

  it("creates issue and returns correct shape", async () => {
    const issue = await createIssue({ title: "Login button broken" });

    expect(issue.id).toBeTypeOf("number");
    expect(issue.createdAt).toBeInstanceOf(Date);
    expect(issue.updatedAt).toBeInstanceOf(Date);
    expect(issue).not.toHaveProperty("created_at");
  });
});

describe("findIssueById tests", () => {
  it("finds an existing issue", async () => {
    const issue = await createIssue({ title: "Login button broken" });
    const found = await findIssueById(issue.id);
    expect(found).toEqual(issue);
  });

  it("returns null when the issue doesn't exist", async () => {
    const found = await findIssueById(999999);
    expect(found).toBeNull();
  });
});
