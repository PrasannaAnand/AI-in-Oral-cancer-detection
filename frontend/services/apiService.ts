import { DetectionResult, RecurrenceFormData, RecurrenceResult } from '../types';

// Utility to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  detectLesion: async (file: File): Promise<DetectionResult> => {
    // Simulate API call
    console.log('Posting to /api/detect-lesion', file.name);
    await delay(2000);

    // Mock response
    // In a real app, use fetch('/api/detect-lesion', { method: 'POST', body: formData })
    return {
      predictedClass: 'OSCC',
      probabilities: [
        { label: 'Normal', value: 0.05 },
        { label: 'Dysplasia', value: 0.15 },
        { label: 'OSCC', value: 0.80 },
      ],
      // Using a placeholder for GradCAM visualization
      gradcamUrl: 'https://picsum.photos/400/300?grayscale&blur=2' 
    };
  },

  predictRecurrence: async (data: RecurrenceFormData): Promise<RecurrenceResult> => {
    // Simulate API call
    console.log('Posting to /api/predict-recurrence', data);
    await delay(2500);

    // Mock logic for demo variety
    const isHighRisk = data.tumorGrade === 'Grade III' || data.tumorGrade === 'Grade IV';
    
    return {
      riskScore: isHighRisk ? 78 : 32,
      riskCategory: isHighRisk ? 'High' : 'Low',
      topFeatures: [
        `Tumor Grade: ${data.tumorGrade}`,
        `Age Group: ${data.ageGroup}`,
        `Site: ${data.oralSite}`
      ]
    };
  }
};