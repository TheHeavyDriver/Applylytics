export type ApplicationStatus = 
  | 'applied'
  | 'screening'
  | 'interview'
  | 'technical'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'accepted';

export type Application = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  platform: string;
  status: ApplicationStatus;
  applied_date: string;
  salary?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type FollowUp = {
  id: string;
  user_id: string;
  application_id: string;
  type: 'email' | 'call' | 'linkedin' | 'other';
  scheduled_date: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
};

export type DashboardStats = {
  total: number;
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
  pendingFollowUps: number;
};

export type Insight = {
  type: 'success_rate' | 'response_rate' | 'avg_response_time' | 'follow_up_needed';
  title: string;
  description: string;
  value: string | number;
  color: string;
};
