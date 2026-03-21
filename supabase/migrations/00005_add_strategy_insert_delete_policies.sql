-- Add missing INSERT and DELETE policies for strategies and strategy_sections

-- Users can create strategies for their own projects
CREATE POLICY "Users can create strategies" ON public.strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own strategies
CREATE POLICY "Users can delete their own strategies" ON public.strategies
  FOR DELETE USING (auth.uid() = user_id);

-- Users can insert sections for their own strategies
CREATE POLICY "Users can create strategy sections" ON public.strategy_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.strategies
      WHERE strategies.id = strategy_sections.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

-- Users can delete sections of their own strategies
CREATE POLICY "Users can delete strategy sections" ON public.strategy_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.strategies
      WHERE strategies.id = strategy_sections.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );
