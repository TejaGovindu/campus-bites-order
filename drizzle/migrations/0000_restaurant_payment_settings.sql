CREATE TABLE public.restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  upi_id TEXT,
  payee_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.restaurant_settings TO anon;
GRANT SELECT, UPDATE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment settings"
  ON public.restaurant_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update payment settings"
  ON public.restaurant_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.restaurant_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;