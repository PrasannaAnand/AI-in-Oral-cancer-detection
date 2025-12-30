// services/apiService.ts
import {
  DetectionResponse,
  RecurrenceInput,
  RecurrenceResponse,
  PredictionClass,
} from "../types";

const BASE_URL = "http://localhost:8000";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  detectLesion: async (file: File): Promise<DetectionResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/api/detect-cancer`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Detection failed');
    }

    const raw = await response.json() as {
      prediction: string;
      confidence: number;
      cancer_probability: number;
    };

    const cancerProb = raw.cancer_probability;
    const nonCancerProb = 1 - cancerProb;

    return {
      prediction: raw.prediction as 'Cancerous' | 'Non-cancerous',
      confidence: raw.confidence,
      cancer_probability: raw.cancer_probability,
      probabilities: {
        Cancerous: cancerProb,
        'Non-cancerous': nonCancerProb,
      },
    };
  },


  // ==========================
  // Recurrence Prediction
  // ==========================
  predictRecurrence: async (
    payload: RecurrenceInput
  ): Promise<RecurrenceResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/api/predict-recurrence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Recurrence backend error: ${response.status}`);
      }

      const data = (await response.json()) as RecurrenceResponse;
      return data;
    } catch (error) {
      console.warn("Recurrence API failed, using mock data:", error);
      await delay(2000);

      const mock: RecurrenceResponse = {
        recurrence_risk_percentage: 65.3,
        risk_category: "High Risk",
        risk_level: "Red",
      };

      return mock;
    }
  },
};
