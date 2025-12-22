// services/apiService.ts
import {
  DetectionResponse,
  RecurrenceInput,
  RecurrenceResponse,
} from "../types";

const BASE_URL = "http://localhost:8000";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  detectLesion: async (file: File): Promise<DetectionResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/api/detect-lesion`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Backend unreachable');
      return await response.json();
    } catch (error) {
      console.warn("Detection API failed, using mock data:", error);
      await delay(1500);
      return {
        predicted_class: 'OSCC',
        probabilities: { "Normal": 0.05, "Dysplasia": 0.15, "OSCC": 0.80 },
        gradcam_url: 'https://picsum.photos/400/300?grayscale&blur=2'
      };
    }
  },

  predictRecurrence: async (payload: RecurrenceInput): Promise<RecurrenceResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/api/predict-recurrence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Backend unreachable');
      return await response.json();
    } catch (error) {
      console.warn("Recurrence API failed, using mock data:", error);
      await delay(2000);
      return {
        recurrence_risk_percentage: 65.3,
        risk_category: "High Risk",
        risk_level: "Red"
      };
    }
  }
};
