DROP POLICY IF EXISTS "anyone reads settings" ON public.app_settings;
REVOKE SELECT ON public.app_settings FROM anon;
GRANT SELECT ON public.app_settings TO authenticated;
CREATE POLICY "signed in reads settings" ON public.app_settings FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);