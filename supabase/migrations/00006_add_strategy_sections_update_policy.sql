-- Allow users to update sections of their own strategies (for manual editing)
CREATE POLICY "Users can update their own strategy sections" ON public.strategy_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.strategies
      WHERE strategies.id = strategy_sections.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );
