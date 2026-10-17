import { type IssueStatus } from "../types.js";

export type TransitionResult = { ok: true } | { ok: false; reason: string };

const ALLOWED_TRANSITIONS: Record<IssueStatus, readonly IssueStatus[]> = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed", "open"],
  closed: [],
};

export function checkTransition(
  from: IssueStatus,
  to: IssueStatus,
): TransitionResult {
  if (ALLOWED_TRANSITIONS[from].includes(to)) {
    return { ok: true };
  }
  return { ok: false, reason: `Transition ${from} -> ${to} is not allowd` };
}
