import { describe, it, expect } from "vitest";
import { checkTransition } from "../../src/services/transitions.js";

describe("checkTransition", () => {
  it.each([
    ["open", "in_progress"],
    ["in_progress", "resolved"],
    ["resolved", "closed"],
    ["resolved", "open"],
  ] as const)("allows %s → %s", (from, to) => {
    expect(checkTransition(from, to)).toEqual({ ok: true });
  });

  it.each([
    ["open", "open"],
    ["open", "resolved"],
    ["open", "closed"],
    ["in_progress", "open"],
    ["in_progress", "in_progress"],
    ["in_progress", "closed"],
    ["resolved", "in_progress"],
    ["resolved", "resolved"],
    ["closed", "open"],
    ["closed", "in_progress"],
    ["closed", "resolved"],
    ["closed", "closed"],
  ] as const)("rejects %s → %s", (from, to) => {
    expect(checkTransition(from, to)).toEqual({
      ok: false,
      reason: expect.any(String),
    });
  });
});
