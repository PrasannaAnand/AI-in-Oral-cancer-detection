import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Disclaimer } from './Disclaimer';
import { apiService } from '../services/apiService';
import { DetectionResponse } from '../types';

export const DetectionView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.detectLesion(file);
      setResult(data);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (label: string) => {
    if (label.includes('Normal')) return '#22c55e';
    if (label.includes('Dysplasia')) return '#f59e0b';
    if (label.includes('OSCC')) return '#ef4444';
    return '#94a3b8';
  };

  // Convert Record<string, number> to Array<{label, value}> for Recharts
  const chartData = result ? Object.entries(result.probabilities).map(([label, value]) => ({
    label,
    value
  })) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          Lesion Detection
        </h2>
        
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <FileUpload 
            file={file} 
            onFileChange={setFile} 
            label="Upload intraoral photograph"
            helperText="Use clear, close-up intraoral photos for best results."
            required
          />
          
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Detection"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-700 mb-4">Analysis Results</h3>
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">Predicted Class</p>
                <div className={`text-3xl font-bold ${
                  result.predicted_class.includes('OSCC') ? 'text-red-600' :
                  result.predicted_class.includes('Dysplasia') ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {result.predicted_class}
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ left: 40, right: 20 }}>
                    <XAxis type="number" hide domain={[0, 1]} />
                    <YAxis dataKey="label" type="category" width={80} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                       {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.label)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
              <h3 className="text-lg font-medium text-slate-700 mb-4">Grad-CAM Visualization</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Original</p>
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {file && <img src={URL.createObjectURL(file)} alt="Original" className="w-full h-full object-cover" />}
                  </div>
                </div>
                {result.gradcam_url && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Heatmap</p>
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                       <img src={result.gradcam_url} alt="Grad-CAM" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Disclaimer />
        </div>
      )}
    </div>
  );
};
