import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { pool } from "../../src/db.js";
import {
  createIssue,
  deleteIssue,
  findIssueById,
  listIssues,
  updateIssue,
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

describe("listIssues tests", () => {
  it("returns [] when there are no issues", async () => {
    const issues = await listIssues();
    expect(issues).toEqual([]);
  });

  it("returns all issues in creation order", async () => {
    const issue1 = await createIssue({ title: "Issue 1" });
    const issue2 = await createIssue({ title: "Issue 2" });

    const issues = await listIssues();
    expect(issues).toEqual([issue1, issue2]);
  });
});

describe("updateIssue tests", () => {
  it("updates only the fields provided", async () => {
    const issue = await createIssue({
      title: "Login button broken",
      description: "Signup form login button",
      priority: "high",
    });
    const updatedIssue = await updateIssue(issue.id, {
      title: "Login button frozen",
    });

    expect(updatedIssue).toMatchObject({
      title: "Login button frozen",
      status: issue.status,
      priority: issue.priority,
      description: issue.description,
    });
  });

  it("changes 'updatedAt' and keeps 'createdAt' the same", async () => {
    const created = await createIssue({ title: "Login button broken" });
    await pool.query(
      "UPDATE issues SET updated_at = now() - interval '1 hour' WHERE id = $1",
      [created.id],
    );

    const before = await findIssueById(created.id);
    if (before === null) throw new Error("issue missing after backdate");

    const updated = await updateIssue(before.id, {
      title: "Login button frozen",
    });

    if (updated === null) throw new Error("updateIssue returned null");

    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      before.updatedAt.getTime(),
    );
    expect(updated.createdAt.getTime()).toBe(before.createdAt.getTime());
  });

  it("clears description when sent as null", async () => {
    const issue = await createIssue({
      title: "Login button broken",
      description: "Signup form",
    });
    const updatedIssue = await updateIssue(issue.id, { description: null });

    if (updatedIssue === null) throw new Error("expected the issue to exist");

    expect(updatedIssue.description).toBeNull();
  });

  it("returns the issue unchanged for empty update", async () => {
    const issue = await createIssue({ title: "Login button broken" });
    const updatedIssue = await updateIssue(issue.id, {});
    expect(updatedIssue).toEqual(issue);
  });

  it("returns null for an id that doesn't exist", async () => {
    const updatedIssue = await updateIssue(10, { title: "New title" });
    expect(updatedIssue).toBeNull();
  });
});

describe("deleteIssue tests", () => {
  it("existing id returns true, then findIssueById returns null", async () => {
    const issue = await createIssue({ title: "Login button broken" });
    const res = await deleteIssue(issue.id);
    expect(res).toBe(true);

    const findIssue = await findIssueById(issue.id);
    expect(findIssue).toBeNull();
  });

  it("missing id returns false", async () => {
    const res = await deleteIssue(10);
    expect(res).toBe(false);
  });
});
