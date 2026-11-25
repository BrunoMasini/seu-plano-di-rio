import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ScheduleValue } from "@/lib/schedule";

export function ScheduleFields({ value, onChange, required = false }: {
  value: ScheduleValue; onChange: (value: ScheduleValue) => void; required?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex w-full flex-wrap items-end gap-3">
      <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${id}-date`}>
        Data
        <Input id={`${id}-date`} aria-label="Data" type="date" required={required} value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })} className="h-10 w-44 max-w-full text-foreground" />
      </label>
      <label className="flex h-10 items-center gap-2 text-sm" htmlFor={`${id}-all-day`}>
        <Checkbox id={`${id}-all-day`} checked={!value.start} onCheckedChange={(checked) =>
          onChange({ ...value, start: checked ? "" : "09:00", end: "" })} />
        Dia inteiro
      </label>
      {value.start && <>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${id}-start`}>
          Início
          <Input id={`${id}-start`} aria-label="Início" type="time" required value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })} className="h-10 w-32 text-foreground" />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${id}-end`}>
          Término (opcional)
          <Input id={`${id}-end`} aria-label="Término (opcional)" type="time" value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })} className="h-10 w-32 text-foreground" />
        </label>
      </>}
    </div>
  );
}