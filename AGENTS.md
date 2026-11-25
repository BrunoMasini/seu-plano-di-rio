
- User data (tasks, projects, goals, reminders, notes) is scoped by `workspace_id` (one workspace per user per kind: student/professional/daily); every panel query and insert must filter/set it — keeps profiles isolated.
- "Add to calendar" uses link/.ics generation in src/lib/calendar.ts, no OAuth — chosen by the user for zero-setup.
