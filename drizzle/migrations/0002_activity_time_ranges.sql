ALTER TABLE public.tasks ADD COLUMN start_time time, ADD COLUMN end_time time;
ALTER TABLE public.goals ADD COLUMN start_time time, ADD COLUMN end_time time;
ALTER TABLE public.projects ADD COLUMN start_time time, ADD COLUMN end_time time;
ALTER TABLE public.reminders ADD COLUMN end_at timestamptz, ADD COLUMN all_day boolean NOT NULL DEFAULT false;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_time_range CHECK ((start_time IS NULL AND end_time IS NULL) OR (due_date IS NOT NULL AND start_time IS NOT NULL AND (end_time IS NULL OR end_time > start_time)));
ALTER TABLE public.goals ADD CONSTRAINT goals_time_range CHECK ((start_time IS NULL AND end_time IS NULL) OR (target_date IS NOT NULL AND start_time IS NOT NULL AND (end_time IS NULL OR end_time > start_time)));
ALTER TABLE public.projects ADD CONSTRAINT projects_time_range CHECK ((start_time IS NULL AND end_time IS NULL) OR (due_date IS NOT NULL AND start_time IS NOT NULL AND (end_time IS NULL OR end_time > start_time)));
ALTER TABLE public.reminders ADD CONSTRAINT reminders_time_range CHECK (end_at IS NULL OR (NOT all_day AND end_at > remind_at));