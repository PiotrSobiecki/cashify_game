import { describe, it, expect } from "vitest";
import { RunController } from "./RunController";
import { SESSION_MAX_MS, WIN_TARGET_PLN } from "../config";

describe("RunController — wygrana Cashify (cel 10 mln zł)", () => {
  it("wins when the score reaches WIN_TARGET_PLN", () => {
    const run = new RunController();
    expect(run.update(WIN_TARGET_PLN - 1, 1000)).toBe(null);
    expect(run.update(WIN_TARGET_PLN, 1000)).toBe("win");
    expect(run.update(WIN_TARGET_PLN + 100_000, 2000)).toBe("win");
  });

  it("ends with death when lives run out", () => {
    const run = new RunController(1);
    expect(run.loseLife()).toBe(false);
    expect(run.endReason).toBe("death");
    expect(run.update(0, 0)).toBe("death");
  });

  it("ends with timeout when the session limit is exceeded", () => {
    const run = new RunController();
    expect(run.update(0, SESSION_MAX_MS - 1)).toBe(null);
    expect(run.update(0, SESSION_MAX_MS)).toBe("timeout");
  });

  it("win takes priority over timeout on the same frame", () => {
    const run = new RunController();
    expect(run.update(WIN_TARGET_PLN, SESSION_MAX_MS)).toBe("win");
  });

  it("does not change the end reason once set", () => {
    const run = new RunController();
    run.update(WIN_TARGET_PLN, 1000);
    expect(run.update(0, SESSION_MAX_MS)).toBe("win");
  });
});
