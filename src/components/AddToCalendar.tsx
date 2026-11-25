import { CalendarPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "@/lib/calendar";

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const downloadIcs = () => {
    const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${event.title.slice(0, 40) || "evento"}.ics`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-primary transition" aria-label="Adicionar ao calendário" title="Adicionar ao calendário">
        <CalendarPlus className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(googleCalendarUrl(event), "_blank", "noopener")}>Google Agenda</DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(outlookCalendarUrl(event), "_blank", "noopener")}>Outlook</DropdownMenuItem>
        <DropdownMenuItem onClick={downloadIcs}>Apple / outro (.ics)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
