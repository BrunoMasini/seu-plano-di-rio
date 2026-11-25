import { describe, it, expect } from "vitest";
import { buildIcs, googleCalendarUrl, localDate } from "./calendar";

describe("calendar", () => {
  it("all-day event spans exactly one day in Google link", () => {
    const url = googleCalendarUrl({ title: "Prova", start: localDate("2026-12-01"), allDay: true });
    expect(new URL(url).searchParams.get("dates")).toBe("20261201/20261202");
  });
  it("timed event defaults to 30 minutes in ICS", () => {
    const ics = buildIcs({ title: "Reunião", start: new Date(Date.UTC(2026, 11, 1, 13, 0)) }, "x");
    expect(ics).toContain("DTSTART:20261201T130000Z");
    expect(ics).toContain("DTEND:20261201T133000Z");
  });
});
