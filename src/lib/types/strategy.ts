// Strategy Builder intake form types
// Corresponds to the strategy_intake table (migration 00009)

export type BusinessStage = 'idea' | 'mvp_early' | 'revenue_generating'

export type IntakeStatus = 'draft' | 'in_progress' | 'completed'

export type StrategyIntake = {
  id: string
  userId: string
  businessName: string
  industry: string
  customIndustry?: string
  businessStage: BusinessStage
  mainChallenge: string
  primaryGoal: string
  status: IntakeStatus
  currentStep: number
  createdAt: string
  updatedAt: string
}

/**
 * Shape returned by Supabase queries (snake_case DB columns).
 * Use this when reading rows directly from the client.
 */
export type StrategyIntakeRow = {
  id: string
  user_id: string
  business_name: string
  industry: string
  custom_industry: string | null
  business_stage: BusinessStage
  main_challenge: string
  primary_goal: string
  status: IntakeStatus
  current_step: number
  created_at: string
  updated_at: string
}

/**
 * Payload for creating a new intake (server-generated fields omitted).
 */
export type StrategyIntakeInsert = {
  business_name: string
  industry: string
  custom_industry?: string
  business_stage: BusinessStage
  main_challenge: string
  primary_goal: string
  status?: IntakeStatus
  current_step?: number
}

/**
 * Payload for updating an existing intake (all fields optional).
 */
export type StrategyIntakeUpdate = Partial<StrategyIntakeInsert>
