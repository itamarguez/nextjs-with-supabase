-- Fix remaining RLS issues for model_performance and outbound_clicks

-- Enable RLS on remaining tables
ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for model_performance (admin read-only table)
CREATE POLICY "Admins can read model performance"
  ON public.model_performance
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Service role can manage model performance"
  ON public.model_performance
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for outbound_clicks (analytics table)
CREATE POLICY "Service role can insert outbound clicks"
  ON public.outbound_clicks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read outbound clicks"
  ON public.outbound_clicks
  FOR SELECT
  USING (is_admin());

SELECT '✅ RLS enabled on model_performance and outbound_clicks!' as status;
