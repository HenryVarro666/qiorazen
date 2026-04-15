export interface Practitioner {
  id: string;
  user_id: string;
  display_name: string;
  title: string | null;
  bio: string | null;
  specialties: string[];
  is_active: boolean;
  max_daily_cases: number;
  cases_reviewed_today: number;
  created_at: string;
}
