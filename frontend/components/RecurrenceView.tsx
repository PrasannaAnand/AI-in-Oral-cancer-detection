import React, { useState } from 'react';
import { Loader2, AlertCircle, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Disclaimer } from './Disclaimer';
import { apiService } from '../services/apiService';
import { RecurrenceFormData, RecurrenceResult } from '../types';
import { AGE_GROUPS, ORAL_SITES, TUMOR_GRADES, TREATMENT_SEQUENCES } from '../constants';

const INITIAL_FORM: RecurrenceFormData = {
  ageGroup: '',
  sex: '',
  oralSite: '',
  tumorGrade: '',
  treatmentSequence: '',
  chemotherapy: ''
};

export const RecurrenceView: React.FC = () => {
  const [formData, setFormData] = useState<RecurrenceFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecurrenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const isValid = Object.values(formData).every(val => val !== '');
    if (!isValid) {
      setError("Please fill in all required clinical fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.predictRecurrence(formData);
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Please check your connection and inputs.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRiskIcon = (cat: string) => {
    switch (cat) {
      case 'Low': return <CheckCircle className="w-5 h-5" />;
      case 'Intermediate': return <Activity className="w-5 h-5" />;
      case 'High': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Clinical Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">
            Clinical Parameters
          </h2>
          
          <form onSubmit={handleSubmit} id="recurrence-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age Group *</label>
                <select 
                  name="ageGroup" 
                  value={formData.ageGroup} 
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Age Group</option>
                  {AGE_GROUPS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sex *</label>
                <select 
                  name="sex" 
                  value={formData.sex} 
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Oral Site *</label>
                <select 
                  name="oralSite" 
                  value={formData.oralSite} 
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Site</option>
                  {ORAL_SITES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tumor Grade *</label>
                <select 
                  name="tumorGrade" 
                  value={formData.tumorGrade} 
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Grade</option>
                  {TUMOR_GRADES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chemotherapy *</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="chemotherapy" 
                      value="Yes" 
                      checked={formData.chemotherapy === 'Yes'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="chemotherapy" 
                      value="No/Unknown" 
                      checked={formData.chemotherapy === 'No/Unknown'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    /> No/Unknown
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Sequence *</label>
                <select 
                  name="treatmentSequence" 
                  value={formData.treatmentSequence} 
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Sequence</option>
                  {TREATMENT_SEQUENCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </form>
        </div>
        
        <button
          form="recurrence-form"
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Predict Recurrence Risk"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Right Column: Results Panel */}
      <div className="lg:col-span-5">
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            Risk Assessment
          </h2>

          {!result ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Complete the form to view prediction</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-2 uppercase tracking-wide">Predicted 5-year Risk</p>
                <div className="text-5xl font-bold text-slate-900 mb-4">
                  {result.riskScore}<span className="text-2xl text-slate-500">%</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border ${getRiskColor(result.riskCategory)}`}>
                  {getRiskIcon(result.riskCategory)}
                  {result.riskCategory} Risk Group
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Contributing Features</h3>
                <div className="space-y-2">
                  {result.topFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Disclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};