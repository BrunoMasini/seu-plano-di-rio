export type CalendarEvent = { title: string; start: Date; end?: Date; allDay?: boolean; details?: string };

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const dayStamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

function range(e: CalendarEvent) {
  if (e.allDay) return { s: dayStamp(e.start), en: dayStamp(addDays(e.start, 1)) };
  const end = e.end ?? new Date(e.start.getTime() + 30 * 60 * 1000);
  return { s: utcStamp(e.start), en: utcStamp(end) };
}

export function googleCalendarUrl(e: CalendarEvent) {
  const { s, en } = range(e);
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${s}/${en}`, details: e.details ?? "" });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl(e: CalendarEvent) {
  const end = e.allDay ? addDays(e.start, 1) : e.end ?? new Date(e.start.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) => (e.allDay ? d.toISOString().slice(0, 10) : d.toISOString());
  const p = new URLSearchParams({
    path: "/calendar/action/compose", rru: "addevent", subject: e.title,
    startdt: fmt(e.start), enddt: fmt(end), body: e.details ?? "",
    ...(e.allDay ? { allday: "true" } : {}),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(e: CalendarEvent, uid = `${Date.now()}@northnote`) {
  const { s, en } = range(e);
  const dt = e.allDay ? [`DTSTART;VALUE=DATE:${s}`, `DTEND;VALUE=DATE:${en}`] : [`DTSTART:${s}`, `DTEND:${en}`];
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//North Note//PT-BR", "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${utcStamp(new Date())}`, ...dt, `SUMMARY:${esc(e.title)}`,
    ...(e.details ? [`DESCRIPTION:${esc(e.details)}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

/** Parse a "YYYY-MM-DD" date column as a local date (not UTC). */
export function localDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}
