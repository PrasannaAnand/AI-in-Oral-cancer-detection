import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-sm text-amber-800">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
      <div>
        <span className="font-semibold block mb-1">Research Use Only</span>
        This system is a research prototype and is not intended for clinical diagnosis. 
        The predictions provided should not be used as a substitute for professional medical advice, 
        diagnosis, or treatment. Always consult with a qualified healthcare provider.
      </div>
    </div>
  );
};
