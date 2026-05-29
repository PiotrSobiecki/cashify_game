import { describe, it, expect } from "vitest";
import { RaceClock } from "./RaceClock";

describe("RaceClock — czas wyścigu z pauzą", () => {
  it("measures elapsed time since start", () => {
    const c = new RaceClock();
    c.start(1000);
    expect(c.elapsed(1500)).toBe(500);
  });

  it("freezes while paused and resumes from the same value", () => {
    const c = new RaceClock();
    c.start(1000);
    c.pause(1500); // upływ zamrożony na 500
    expect(c.isPaused).toBe(true);
    expect(c.elapsed(4000)).toBe(500); // mimo upływu zegara sceny
    c.resume(4000);
    expect(c.isPaused).toBe(false);
    expect(c.elapsed(4200)).toBe(700); // 500 + 200 po wznowieniu
  });

  it("accumulates multiple pauses correctly", () => {
    const c = new RaceClock();
    c.start(0);
    c.pause(1000); // gra: 1000
    c.resume(3000); // pauza 2000 pominięta
    c.pause(4000); // gra: kolejne 1000 (łącznie 2000)
    c.resume(9000); // pauza 5000 pominięta
    expect(c.elapsed(10000)).toBe(3000); // 10000 − (2000+5000) pauz
  });
});
