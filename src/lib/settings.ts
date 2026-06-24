import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppSettings = {
  id: string;
  app_name: string;
  tagline: string;
  greeting: string;
  tab_today: string;
  tab_projects: string;
  tab_goals: string;
  tab_reminders: string;
  tab_notes: string;
  tab_completed: string;
};

const DEFAULTS: AppSettings = {
  id: "",
  app_name: "North Note",
  tagline: "Comece pelo que importa hoje. Depois, olhe para onde quer chegar.",
  greeting: "Bom te ver de novo.",
  tab_today: "Hoje",
  tab_projects: "Projetos",
  tab_goals: "Metas",
  tab_reminders: "Agenda",
  tab_notes: "Notas",
  tab_completed: "Concluídas",
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (mounted && data) setSettings(data as AppSettings);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { settings, loading };
}

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!userId) { setIsAdmin(false); return; }
    let mounted = true;
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle()
      .then(({ data }) => { if (mounted) setIsAdmin(!!data); });
    return () => { mounted = false; };
  }, [userId]);
  return isAdmin;
}
