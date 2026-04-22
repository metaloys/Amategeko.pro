export type SubscriptionTier = 'free' | 'standard' | 'pass_guarantee'
export type QuestionCategory = 
  | 'traffic_rules' | 'road_signs' | 'vehicle_regulations'
  | 'right_of_way' | 'overtaking_parking' 
  | 'special_conditions' | 'driver_responsibilities'
export type ExamMode = 'practice' | 'mock_exam'
export type PaymentProvider = 'flutterwave' | 'mtn_momo' | 'airtel_money'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type AnswerOption = 'a' | 'b' | 'c' | 'd'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: SubscriptionTier
  subscription_expires_at: string | null
  questions_answered_total: number
  exams_taken_total: number
  current_streak_days: number
  last_active_date: string | null
  preferred_language: 'kw' | 'en'
  created_at: string
  updated_at: string
}

export interface Question {
  id: number
  question_text_kw: string
  question_text_en: string | null
  option_a_kw: string
  option_b_kw: string
  option_c_kw: string
  option_d_kw: string
  correct_answer: AnswerOption
  explanation_kw: string | null
  category: QuestionCategory
  difficulty: 1 | 2 | 3
  has_image: boolean
  image_url: string | null
  is_active: boolean
  source_question_number: number | null
}

export interface ExamSession {
  id: string
  user_id: string
  mode: ExamMode
  questions_snapshot: Question[]
  answers: Record<string, AnswerOption>
  total_questions: number
  correct_count: number | null
  score_percent: number | null
  passed: boolean | null
  pass_threshold: number
  category_scores: Record<string, { correct: number; total: number }> | null
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  is_completed: boolean
  abandoned: boolean
}

export interface Payment {
  id: string
  user_id: string
  provider: PaymentProvider
  provider_tx_id: string | null
  amount_rwf: number
  plan_purchased: SubscriptionTier
  plan_duration_days: number
  status: PaymentStatus
  webhook_verified: boolean
  initiated_at: string
  confirmed_at: string | null
}
