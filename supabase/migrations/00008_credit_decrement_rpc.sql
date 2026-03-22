-- Atomic credit decrement function
-- Called from the entitlement engine when a strategy is generated.
-- Decrements credits_remaining, increments credits_used, and logs the transaction.

CREATE OR REPLACE FUNCTION public.decrement_strategy_credit(
  p_user_id UUID,
  p_strategy_project_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_remaining INT;
  v_is_unlimited BOOLEAN;
BEGIN
  -- Lock the row for update
  SELECT credits_remaining, unlimited
  INTO v_remaining, v_is_unlimited
  FROM public.strategy_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Unlimited users don't decrement
  IF v_is_unlimited THEN
    INSERT INTO public.credit_transactions (user_id, amount, reason, strategy_project_id, balance_after)
    VALUES (p_user_id, -1, 'generation', p_strategy_project_id, -1);
    RETURN;
  END IF;

  -- Check balance
  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RAISE EXCEPTION 'Insufficient strategy credits';
  END IF;

  -- Decrement
  UPDATE public.strategy_credits
  SET
    credits_remaining = credits_remaining - 1,
    credits_used = credits_used + 1
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, reason, strategy_project_id, balance_after)
  VALUES (p_user_id, -1, 'generation', p_strategy_project_id, v_remaining - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
