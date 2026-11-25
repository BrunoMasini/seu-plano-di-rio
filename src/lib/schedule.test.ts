import { describe, expect, it } from "vitest";
import { scheduleEvent, scheduleError, scheduleColumns, reminderColumns, reminderSchedule } from "./schedule";
import { buildIcs, googleCalendarUrl, outlookCalendarUrl } from "./calendar";

describe("activity schedules", () => {
  it("keeps training scheduled from 13:00 to 14:00 across calendars", () => {
    const event = scheduleEvent("Treinar", { date: "2026-12-01", start: "13:00", end: "14:00" });
    expect(event.start.getHours()).toBe(13);
    expect(event.end?.getHours()).toBe(14);
    expect((event.end?.getTime() ?? 0) - event.start.getTime()).toBe(3600000);
    const dates = new URL(googleCalendarUrl(event)).searchParams.get("dates")?.split("/");
    expect(dates?.[0]).not.toBe(dates?.[1]);
    expect(buildIcs(event)).toContain("DTEND:");
    expect(new URL(outlookCalendarUrl(event)).searchParams.get("enddt")).toBe(event.end?.toISOString());
  });
  it("allows a faculty appointment starting at 17:00 with no explicit end", () => {
    const event = scheduleEvent("Faculdade", { date: "2026-12-01", start: "17:00", end: "" });
    expect(event.start.getHours()).toBe(17);
    expect(event.allDay).toBe(false);
    expect(event.end).toBeUndefined();
    expect(scheduleColumns({ date: "2026-12-01", start: "17:00", end: "" })).toEqual({ start_time: "17:00", end_time: null });
  });
  it("preserves date-only events as all day", () => {
    const event = scheduleEvent("Estudar", { date: "2026-12-01", start: "", end: "" });
    expect(new URL(googleCalendarUrl(event)).searchParams.get("dates")).toBe("20261201/20261202");
    expect(event.allDay).toBe(true);
  });
  it("rejects a finish before or at the start", () => {
    expect(scheduleError({ date: "2026-12-01", start: "13:00", end: "12:00" })).toBe("O término deve ser após o início.");
    expect(scheduleError({ date: "2026-12-01", start: "13:00", end: "13:00" })).toBe("O término deve ser após o início.");
  });
  it("requires a date for timed activities", () => {
    expect(scheduleError({ date: "", start: "17:00", end: "" })).toBe("Selecione a data para definir horários.");
  });
  it("round-trips reminder times without changing local hours", () => {
    const value = { date: "2026-12-01", start: "13:00", end: "14:00" };
    const stored = reminderColumns(value);
    expect(reminderSchedule(stored.remind_at, stored.end_at, stored.all_day)).toEqual(value);
  });
});