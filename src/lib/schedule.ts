import { localDate, type CalendarEvent } from "./calendar";

export type ScheduleValue = { date: string; start: string; end: string };
export const emptySchedule = (): ScheduleValue => ({ date: "", start: "", end: "" });
export function scheduleError(value: ScheduleValue) {
  if ((value.start || value.end) && !value.date) return "Selecione a data para definir horários.";
  if (value.end && !value.start) return "Informe o horário de início.";
  if (value.end && value.end <= value.start) return "O término deve ser após o início.";
  return null;
}
export function scheduleColumns(value: ScheduleValue) {
  return { start_time: value.start || null, end_time: value.end || null };
}
export function storedSchedule(date: string | null, start: string | null, end: string | null): ScheduleValue {
  return { date: date ?? "", start: start?.slice(0, 5) ?? "", end: end?.slice(0, 5) ?? "" };
}
export function scheduleEvent(title: string, value: ScheduleValue, details = ""): CalendarEvent {
  const start = value.start ? new Date(`${value.date}T${value.start}`) : localDate(value.date);
  return { title, start, allDay: !value.start, details, ...(value.end ? { end: new Date(`${value.date}T${value.end}`) } : {}) };
}
export function scheduleLabel(value: ScheduleValue) {
  if (!value.date) return "";
  const date = localDate(value.date).toLocaleDateString("pt-BR");
  return `${date} · ${value.start ? value.start + (value.end ? ` – ${value.end}` : "") : "Dia inteiro"}`;
}
export function localInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function reminderSchedule(start: string, end: string | null, allDay: boolean): ScheduleValue {
  const input = localInput(start);
  return { date: input.slice(0, 10), start: allDay ? "" : input.slice(11), end: end ? localInput(end).slice(11) : "" };
}
export function reminderColumns(value: ScheduleValue) {
  const event = scheduleEvent("", value);
  return { remind_at: event.start.toISOString(), end_at: event.end?.toISOString() ?? null, all_day: !value.start };
}