export type ConsentType =
  | "health_data_collection"
  | "tongue_image_collection"
  | "tongue_image_practitioner_access"
  | "ai_processing"
  | "terms_of_service"
  | "privacy_policy";

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  consent_version: string;
  granted: boolean;
  ip_address: string | null;
  user_agent: string | null;
  granted_at: string;
  revoked_at: string | null;
}
