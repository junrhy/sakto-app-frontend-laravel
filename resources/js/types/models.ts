export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration_in_days: number;
  credits_per_month: number;
  features?: string[];
  is_popular: boolean;
  is_active: boolean;
  badge_text?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  identifier: string;
  user_identifier: string;
  user_name?: string;
  subscription_plan_id: number;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  cancelled_at?: string;
  payment_method?: string;
  payment_transaction_id?: string;
  amount_paid: number;
  proof_of_payment?: string;
  auto_renew: boolean;
  cancellation_reason?: string;
  last_credit_date?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  email_verified_at?: string;
  is_admin: boolean;
  identifier: string;
  project_identifier?: string;
  app_currency?: string;
  theme?: string;
  theme_color?: string;
  created_at: string;
  updated_at: string;
} 