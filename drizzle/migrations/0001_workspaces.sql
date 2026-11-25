CREATE TYPE public.workspace_kind AS ENUM ('student','professional','daily');
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind public.workspace_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ws select" ON public.workspaces FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ws insert" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ws delete" ON public.workspaces FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.tasks ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

INSERT INTO public.workspaces (user_id, kind)
SELECT DISTINCT user_id, 'daily'::public.workspace_kind FROM (
  SELECT user_id FROM public.tasks UNION SELECT user_id FROM public.goals
  UNION SELECT user_id FROM public.reminders UNION SELECT user_id FROM public.notes
  UNION SELECT user_id FROM public.projects) u
ON CONFLICT DO NOTHING;

UPDATE public.tasks t SET workspace_id = w.id FROM public.workspaces w WHERE w.user_id = t.user_id AND w.kind = 'daily' AND t.workspace_id IS NULL;
UPDATE public.goals t SET workspace_id = w.id FROM public.workspaces w WHERE w.user_id = t.user_id AND w.kind = 'daily' AND t.workspace_id IS NULL;
UPDATE public.reminders t SET workspace_id = w.id FROM public.workspaces w WHERE w.user_id = t.user_id AND w.kind = 'daily' AND t.workspace_id IS NULL;
UPDATE public.notes t SET workspace_id = w.id FROM public.workspaces w WHERE w.user_id = t.user_id AND w.kind = 'daily' AND t.workspace_id IS NULL;
UPDATE public.projects t SET workspace_id = w.id FROM public.workspaces w WHERE w.user_id = t.user_id AND w.kind = 'daily' AND t.workspace_id IS NULL;