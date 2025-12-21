export type PredictionClass = 'Normal' | 'Dysplasia' | 'OSCC';

export interface DetectionResult {
  predictedClass: PredictionClass;
  probabilities: {
    label: string;
    value: number;
  }[];
  gradcamUrl?: string;
}

export type RiskCategory = 'Low' | 'Intermediate' | 'High';

export interface RecurrenceResult {
  riskScore: number; // 0-100
  riskCategory: RiskCategory;
  topFeatures: string[];
}

export interface RecurrenceFormData {
  ageGroup: string;
  sex: string;
  oralSite: string;
  tumorGrade: string;
  treatmentSequence: string;
  chemotherapy: string;
}

export enum AppTab {
  DETECTION = 'detection',
  RECURRENCE = 'recurrence',
}
