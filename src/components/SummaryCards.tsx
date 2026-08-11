import React from 'react';
import { DollarSign, Package, AlertCircle, CalendarX, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ItemAnalysisSummary } from '../types';

interface SummaryCardsProps {
  summary: ItemAnalysisSummary;
  onFilterClick?: (filterType: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onFilterClick }) => {
  const totalUncovered = summary.noWorkOrderCount + summary.scheduleConflictCount + summary.qtyShortageCount;
  const coverageRate = summary.totalItems > 0 
    ? Math.round((summary.coveredCount / summary.totalItems) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Backorder Value */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Backorder Value</span>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">
            ${summary.totalBackorderValue.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Ex GST across {summary.totalItems} line items</p>
        </div>
      </div>

      {/* 2. Total Backorder Qty */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Backorder Volume</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">
            {summary.totalBackorderQty.toLocaleString('en-AU')} <span className="text-sm font-normal text-slate-500">units</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Pending customer fulfillment</p>
        </div>
      </div>

      {/* 3. Urgent & Critical Items */}
      <div 
        onClick={() => onFilterClick && onFilterClick('CRITICAL')}
        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between transition-all ${
          onFilterClick ? 'cursor-pointer hover:border-red-300 hover:shadow-xs' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical / Urgent</span>
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-red-600 flex items-baseline space-x-2">
            <span>{summary.criticalCount}</span>
            <span className="text-xs font-normal text-slate-500">/ {summary.totalItems} items</span>
          </div>
          <p className="text-xs text-red-500 mt-1 font-medium">Overdue or due within 14 days</p>
        </div>
      </div>

      {/* 4. Missing Work Orders & Conflicts */}
      <div 
        onClick={() => onFilterClick && onFilterClick('CONFLICTS')}
        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between transition-all ${
          onFilterClick ? 'cursor-pointer hover:border-amber-300 hover:shadow-xs' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">WO Conflicts</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <CalendarX className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-700 flex items-baseline space-x-2">
            <span>{totalUncovered}</span>
            <span className="text-xs font-normal text-slate-500">
              ({summary.noWorkOrderCount} missing WO)
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">
            {summary.scheduleConflictCount} date lag · {summary.qtyShortageCount} qty shortage
          </p>
        </div>
      </div>

      {/* 5. Production Coverage Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WO Coverage</span>
          <div className={`p-2 rounded-lg ${coverageRate > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-slate-900">{coverageRate}%</span>
            <span className="text-xs text-slate-500">{summary.coveredCount} covered</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${coverageRate > 80 ? 'bg-emerald-500' : coverageRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, coverageRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
