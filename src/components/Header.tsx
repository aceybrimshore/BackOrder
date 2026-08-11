import React from 'react';
import { PackageSearch, Upload, PlusCircle, RefreshCw, Download, AlertTriangle, Save } from 'lucide-react';

interface HeaderProps {
  activeTab: 'backorders' | 'workorders' | 'timeline' | 'conflicts';
  setActiveTab: (tab: 'backorders' | 'workorders' | 'timeline' | 'conflicts') => void;
  onOpenUploadModal: () => void;
  onOpenAddWoModal: () => void;
  onResetData: () => void;
  onExportCsv: () => void;
  totalConflictsCount: number;
  lastSavedTime?: string | null;
  isCustomData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onOpenAddWoModal,
  onResetData,
  onExportCsv,
  totalConflictsCount,
  lastSavedTime,
  isCustomData
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <PackageSearch className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backorder & Production Conflict Analyzer</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Saved locally in your browser at zero cost">
                  <Save className="w-3 h-3 text-emerald-600" />
                  <span>{isCustomData ? 'Saved in Browser' : 'Sample Data'}</span>
                  {lastSavedTime && <span className="text-[10px] text-emerald-600 font-normal ml-1">• {lastSavedTime}</span>}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100% Free Browser Storage • Automated CSV Backorder Parsing & Production Conflict Detection
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Upload new Backorder Report or Work Orders CSV to update dataset"
            >
              <Upload className="w-3.5 h-3.5 text-slate-900" />
              <span>Import CSV / Update</span>
            </button>

            <button
              onClick={onOpenAddWoModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Work Order</span>
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer"
              title="Export Current Analysis to CSV File"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset to Original Sample Dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex border-t border-slate-100 space-x-1 sm:space-x-4 overflow-x-auto pt-2 pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('backorders')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'backorders'
                ? 'border-amber-500 text-slate-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Backorder Report</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'conflicts'
                ? 'border-red-500 text-slate-900 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${totalConflictsCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <span>Production Conflicts</span>
            {totalConflictsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                {totalConflictsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'timeline'
                ? 'border-amber-500 text-slate-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Production Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('workorders')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'workorders'
                ? 'border-amber-500 text-slate-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Scheduled Work Orders</span>
          </button>
        </div>
      </div>
    </header>
  );
};
