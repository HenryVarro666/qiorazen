export type TongueAnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface TongueAnalysisResult {
  tongue_color: string;
  coating: string;
  shape: string;
  features: string[];
}

export interface TongueImage {
  id: string;
  user_id: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string;
  file_size_bytes: number | null;
  analysis_status: TongueAnalysisStatus;
  analysis_result: TongueAnalysisResult | null;
  auto_delete_at: string | null;
  deleted_at: string | null;
  consent_record_id: string | null;
  created_at: string;
}
