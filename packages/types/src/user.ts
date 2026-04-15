export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: "en" | "zh";
  timezone: string;
  created_at: string;
  updated_at: string;
}
