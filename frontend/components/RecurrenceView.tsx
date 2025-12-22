import React, { useState } from 'react';
import { Loader2, AlertCircle, Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Disclaimer } from './Disclaimer';
import { apiService } from '../services/apiService';
import { RecurrenceInput, RecurrenceResponse } from '../types';
import { RACES, SITE_RECODES, GRADE_RECODES, SURG_RAD_SEQUENCES, YES_NO_UNKNOWN } from '../constants';

const INITIAL_FORM: RecurrenceInput = {
  sex: '',
  race: '',
  site_recode: '',
  grade_recode: '',
  total_malig_tumors: 1,
  total_benign_tumors: 0,
  rx_summ_surg_prim_site: 0,
  rx_summ_surg_rad_seq: '',
  chemotherapy_recode: '',
  radiation_recode: ''
};

export const RecurrenceView: React.FC = () => {
  const [formData, setFormData] = useState<RecurrenceInput>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecurrenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  const isFormValid = () => {
    return (
      formData.sex !== '' &&
      formData.race !== '' &&
      formData.site_recode !== '' &&
      formData.grade_recode !== '' &&
      formData.rx_summ_surg_rad_seq !== '' &&
      formData.chemotherapy_recode !== '' &&
      formData.radiation_recode !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.predictRecurrence(formData);
      setResult(data);
    } catch (err: any) {
      setError("Unable to connect to prediction server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeStyles = (level: string) => {
    if (level === 'Red') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'Yellow') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">
            Clinical Parameters (LightGBM Inputs)
          </h2>
          <form onSubmit={handleSubmit} id="recurrence-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sex *</label>
                <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Race *</label>
                <select name="race" value={formData.race} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Race</option>
                  {RACES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tumor Site *</label>
                <select name="site_recode" value={formData.site_recode} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Site</option>
                  {SITE_RECODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tumor Grade *</label>
                <select name="grade_recode" value={formData.grade_recode} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Grade</option>
                  {GRADE_RECODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Malignant Tumors *</label>
                <input type="number" min="0" name="total_malig_tumors" value={formData.total_malig_tumors} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benign Tumors *</label>
                <input type="number" min="0" name="total_benign_tumors" value={formData.total_benign_tumors} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">Primary Surgery Code *</label>
                <input type="number" name="rx_summ_surg_prim_site" value={formData.rx_summ_surg_prim_site} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Sequence *</label>
                <select name="rx_summ_surg_rad_seq" value={formData.rx_summ_surg_rad_seq} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Sequence</option>
                  {SURG_RAD_SEQUENCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chemotherapy *</label>
                <select name="chemotherapy_recode" value={formData.chemotherapy_recode} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Option</option>
                  {YES_NO_UNKNOWN.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Radiation *</label>
                <select name="radiation_recode" value={formData.radiation_recode} onChange={handleInputChange} className="w-full bg-white rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Option</option>
                  {YES_NO_UNKNOWN.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </form>
        </div>
        <button form="recurrence-form" type="submit" disabled={loading || !isFormValid()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Predict Recurrence Risk"}
        </button>
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</div>}
      </div>

      <div className="lg:col-span-5">
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full sticky top-24 ${loading ? 'opacity-50' : ''}`}>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Model Prediction</h2>
          {!result ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm text-center px-6">Complete all variables to run the model</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-2 uppercase tracking-wide">Recurrence Probability</p>
                <div className={`text-6xl font-black mb-6 ${result.risk_level === 'Red' ? 'text-red-600' : result.risk_level === 'Yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.recurrence_risk_percentage.toFixed(1)}<span className="text-2xl text-slate-400 font-normal">%</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-base border shadow-sm ${getRiskBadgeStyles(result.risk_level)}`}>
                  {result.risk_category}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <span className="font-bold">Interpretation:</span> This score estimates probability of poor outcome based on clinical variables (demographics, site, grade, treatment).
                </p>
              </div>
              <Disclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
