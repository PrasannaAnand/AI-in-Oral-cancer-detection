import React, { useState } from 'react';
import { Stethoscope, Activity, FileSearch } from 'lucide-react';
import { DetectionView } from './components/DetectionView';
import { RecurrenceView } from './components/RecurrenceView';
import { AppTab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DETECTION);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Oral Cancer AI</h1>
                <p className="text-xs text-slate-500">Detection & Recurrence System</p>
              </div>
            </div>
            
            <div className="hidden md:block">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Research Prototype v1.0
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab(AppTab.DETECTION)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === AppTab.DETECTION
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              <FileSearch className="w-4 h-4" />
              Lesion Detection
            </button>
            <button
              onClick={() => setActiveTab(AppTab.RECURRENCE)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === AppTab.RECURRENCE
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              <Activity className="w-4 h-4" />
              Recurrence Risk
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === AppTab.DETECTION ? (
          <DetectionView />
        ) : (
          <RecurrenceView />
        )}
      </main>
    </div>
  );
}

export default App;