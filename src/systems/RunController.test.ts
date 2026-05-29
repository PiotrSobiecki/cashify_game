import { describe, it, expect } from "vitest";
import { RunController } from "./RunController";
import { SESSION_MAX_MS, WIN_SCORE } from "../config";

describe("RunController — wygrana Cashify (cel WIN_SCORE)", () => {
  it("wins when the score reaches WIN_SCORE", () => {
    const run = new RunController();
    expect(run.update(WIN_SCORE - 1, 1000)).toBe(null);
    expect(run.update(WIN_SCORE, 1000)).toBe("win");
    expect(run.endReason).toBe("win");
  });

  it("starts with 3 lives; survives two deaths, ends on the third", () => {
    const run = new RunController(3);
    expect(run.lives).toBe(3);
    expect(run.loseLife()).toBe(true);
    expect(run.loseLife()).toBe(true);
    expect(run.loseLife()).toBe(false);
    expect(run.endReason).toBe("death");
  });

  it("times out past the limit without a win", () => {
    const run = new RunController();
    expect(run.update(100, SESSION_MAX_MS)).toBe("timeout");
  });

  it("prioritizes win over timeout when both hold", () => {
    const run = new RunController();
    expect(run.update(WIN_SCORE, SESSION_MAX_MS)).toBe("win");
  });

  it("keeps the first end reason on later updates (idempotent)", () => {
    const run = new RunController();
    run.update(WIN_SCORE, 1000);
    expect(run.update(0, SESSION_MAX_MS)).toBe("win");
  });
});
