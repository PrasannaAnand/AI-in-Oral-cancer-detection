// types.ts

export type PredictionClass = 'Normal' | 'Dysplasia' | 'OSCC';

// Lesion / Cancer Detection types
export interface DetectionResponse {
  predicted_class: string;
  probabilities: Record<string, number>;
  gradcam_url?: string;
}

// Recurrence Prediction types (LightGBM Inputs)
export interface RecurrenceInput {
  sex: string;
  race: string;
  site_recode: string;
  grade_recode: string;
  total_malig_tumors: number;
  total_benign_tumors: number;
  rx_summ_surg_prim_site: number;
  rx_summ_surg_rad_seq: string;
  chemotherapy_recode: string;
  radiation_recode: string;
  age_group: string;   // NEW
}


export interface RecurrenceResponse {
  recurrence_risk_percentage: number;
  risk_category: string;
  risk_level: string; // "Green", "Yellow", "Red"
  top_features?: Record<string, number>;
}

export enum AppTab {
  DETECTION = 'detection',
  RECURRENCE = 'recurrence',
}
