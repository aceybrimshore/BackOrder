import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { BackOrderItem, WorkOrder, GlobalFilterState } from './types';
import { INITIAL_BACKORDER_CSV, INITIAL_WORKORDER_CSV } from './data/initialCsvData';
import { parseBackOrderCsv, parseWorkOrderCsv, exportBackOrdersToCsv } from './utils/csvParser';
import { analyzeBackOrders, generateAnalysisSummary } from './utils/analysisEngine';
import { Header } from './components/Header';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { SummaryCards } from './components/SummaryCards';
import { ConflictAlerts } from './components/ConflictAlerts';
import { BackOrderTable } from './components/BackOrderTable';
import { WorkOrdersManager } from './components/WorkOrdersManager';
import { TimelineGanttView } from './components/TimelineGanttView';
import { CsvUploaderModal } from './components/CsvUploaderModal';
import { ItemDetailModal } from './components/ItemDetailModal';

const STORAGE_KEY_BACKORDERS = 'backorder_analyzer_raw_bo_v2';
const STORAGE_KEY_WORKORDERS = 'backorder_analyzer_work_orders_v2';
const STORAGE_KEY_LAST_SAVED = 'backorder_analyzer_last_saved_v2';

export default function App() {
  // Local storage state flags
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SAVED);
  });

  const [isCustomData, setIsCustomData] = useState<boolean>(() => {
    return !!(localStorage.getItem(STORAGE_KEY_BACKORDERS) || localStorage.getItem(STORAGE_KEY_WORKORDERS));
  });

  // 1. Raw Data States (Initialized from local storage if available)
  const [rawBackOrders, setRawBackOrders] = useState<Partial<BackOrderItem>[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BACKORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial demo dataset
    }
    return parseBackOrderCsv(INITIAL_BACKORDER_CSV);
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial demo dataset
    }
    return parseWorkOrderCsv(INITIAL_WORKORDER_CSV);
  });

  // Auto-save state changes locally in browser
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BACKORDERS, JSON.stringify(rawBackOrders));
      localStorage.setItem(STORAGE_KEY_WORKORDERS, JSON.stringify(workOrders));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(STORAGE_KEY_LAST_SAVED, timeStr);
      setLastSavedTime(timeStr);
    } catch {
      // Ignore quota errors
    }
  }, [rawBackOrders, workOrders]);

  // 2. Global Filter State (Location, Brand, Item Type & Cutoff Date)
  const [globalFilters, setGlobalFilters] = useState<GlobalFilterState>({
    location: 'ALL',
    brand: 'ALL',
    itemType: 'ALL',
    cutoffDate: null
  });

  // 3. Active Tab State
  const [activeTab, setActiveTab] = useState<'backorders' | 'workorders' | 'timeline' | 'conflicts'>('backorders');

  // 4. Modal & Notification States
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [uploaderTarget, setUploaderTarget] = useState<'backorders' | 'workorders'>('backorders');
  const [selectedItem, setSelectedItem] = useState<BackOrderItem | null>(null);
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 5. Derived Analyzed Data (All vs Filtered by Location, Type & Date Slider)
  const allAnalyzedItems = useMemo(() => {
    return analyzeBackOrders(rawBackOrders, workOrders);
  }, [rawBackOrders, workOrders]);

  const filteredAnalyzedItems = useMemo(() => {
    return allAnalyzedItems.filter(item => {
      // Location filter
      if (globalFilters.location !== 'ALL') {
        const itemLoc = item.location ? item.location.trim() : 'Unassigned';
        if (itemLoc !== globalFilters.location) return false;
      }

      // Brand filter
      if (globalFilters.brand !== 'ALL') {
        const itemBrand = item.brand ? item.brand.trim() : 'Unassigned';
        if (itemBrand !== globalFilters.brand) return false;
      }

      // Item Type filter
      if (globalFilters.itemType !== 'ALL') {
        const itemTypeStr = (item.typeCategory || item.classCategory || 'Standard').trim();
        if (itemTypeStr !== globalFilters.itemType) return false;
      }

      // Cutoff Date filter (required on or before cutoff date)
      if (globalFilters.cutoffDate && item.supplyRequiredDateParsed) {
        const cutoffMs = new Date(globalFilters.cutoffDate).getTime();
        if (item.supplyRequiredDateParsed.getTime() > cutoffMs) return false;
      }

      return true;
    });
  }, [allAnalyzedItems, globalFilters]);

  const summary = useMemo(() => {
    return generateAnalysisSummary(filteredAnalyzedItems);
  }, [filteredAnalyzedItems]);

  const totalConflictsCount = useMemo(() => {
    return filteredAnalyzedItems.filter(
      i => !i.isShippingOrNonInventory && (
        i.conflictStatus === 'NO_WORK_ORDER' ||
        i.conflictStatus === 'SCHEDULE_CONFLICT' ||
        i.conflictStatus === 'QUANTITY_SHORTAGE'
      )
    ).length;
  }, [filteredAnalyzedItems]);

  // Handlers
  const handleUpdateGlobalFilters = (updated: Partial<GlobalFilterState>) => {
    setGlobalFilters(prev => ({ ...prev, ...updated }));
  };

  const handleResetGlobalFilters = () => {
    setGlobalFilters({
      location: 'ALL',
      brand: 'ALL',
      itemType: 'ALL',
      cutoffDate: null
    });
  };

  // Handlers
  const handleImportCsvs = (data: { backordersCsv?: string; workordersCsv?: string }): {
    success: boolean;
    backordersCount?: number;
    workordersCount?: number;
    error?: string;
  } => {
    let boCount = 0;
    let woCount = 0;
    let parsedBo = null;
    let parsedWo = null;

    if (data.backordersCsv && data.backordersCsv.trim()) {
      parsedBo = parseBackOrderCsv(data.backordersCsv);
      if (parsedBo.length === 0) {
        return {
          success: false,
          error: 'Could not parse any valid records from the Backorder Report CSV. Please check file columns.'
        };
      }
      boCount = parsedBo.length;
    }

    if (data.workordersCsv && data.workordersCsv.trim()) {
      parsedWo = parseWorkOrderCsv(data.workordersCsv);
      if (parsedWo.length === 0) {
        return {
          success: false,
          error: 'Could not parse any valid records from the Work Orders CSV. Please check file columns.'
        };
      }
      woCount = parsedWo.length;
    }

    if (!parsedBo && !parsedWo) {
      return { success: false, error: 'No CSV data provided to import.' };
    }

    if (parsedBo) {
      setRawBackOrders(parsedBo);
    }
    if (parsedWo) {
      setWorkOrders(parsedWo);
    }

    if (parsedBo && parsedWo) {
      setActiveTab('backorders');
      setToast({
        id: Date.now(),
        title: 'Both Datasets Updated!',
        message: `Successfully loaded ${boCount} backorders and ${woCount} work orders simultaneously.`
      });
    } else if (parsedBo) {
      setActiveTab('backorders');
      setToast({
        id: Date.now(),
        title: 'Backorder Report Loaded',
        message: `Successfully processed and loaded ${boCount} backorder item records!`
      });
    } else if (parsedWo) {
      setActiveTab('workorders');
      setToast({
        id: Date.now(),
        title: 'Scheduled Work Orders Loaded',
        message: `Successfully processed and loaded ${woCount} work order manufacturing records!`
      });
    }

    return {
      success: true,
      backordersCount: boCount,
      workordersCount: woCount
    };
  };

  const handleImportCsv = (csvText: string, targetType: 'backorders' | 'workorders'): boolean => {
    if (targetType === 'backorders') {
      const res = handleImportCsvs({ backordersCsv: csvText });
      return res.success;
    } else {
      const res = handleImportCsvs({ workordersCsv: csvText });
      return res.success;
    }
  };

  const handleAddWorkOrder = (newWo: Omit<WorkOrder, 'id'>) => {
    const created: WorkOrder = {
      ...newWo,
      id: `wo-custom-${Date.now()}-${Math.random()}`
    };
    setWorkOrders(prev => [created, ...prev]);
  };

  const handleDeleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(w => w.id !== id));
  };

  const handleQuickCreateWo = (item: BackOrderItem) => {
    const defaultDate = item.supplyRequiredByDate || '15/08/2026';
    const newWo: Omit<WorkOrder, 'id'> = {
      woNumber: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      item: item.item.trim().toUpperCase(),
      scheduledQty: item.backOrderQty || 100,
      scheduledDate: defaultDate,
      scheduledDateParsed: item.supplyRequiredDateParsed,
      status: 'Planned',
      workCenter: 'Assembly Line 1',
      notes: `Quick created for BO Doc ${item.documentNumber} (${item.customerName})`
    };
    handleAddWorkOrder(newWo);
  };

  const handleResetData = () => {
    if (window.confirm('Reset backorder report and work orders dataset back to original sample data?')) {
      try {
        localStorage.removeItem(STORAGE_KEY_BACKORDERS);
        localStorage.removeItem(STORAGE_KEY_WORKORDERS);
        localStorage.removeItem(STORAGE_KEY_LAST_SAVED);
      } catch {
        // Ignore storage errors
      }
      setIsCustomData(false);
      setLastSavedTime(null);
      setRawBackOrders(parseBackOrderCsv(INITIAL_BACKORDER_CSV));
      setWorkOrders(parseWorkOrderCsv(INITIAL_WORKORDER_CSV));
      setToast({
        id: Date.now(),
        title: 'Dataset Reset',
        message: 'Restored original sample backorders and work orders dataset.'
      });
    }
  };

  const handleExportCsv = () => {
    const csvStr = exportBackOrdersToCsv(filteredAnalyzedItems);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Backorder_Conflict_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSummaryCardFilterClick = (filterType: string) => {
    if (filterType === 'CRITICAL' || filterType === 'CONFLICTS') {
      setActiveTab('conflicts');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased relative">
      {/* Success Completion Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-emerald-500/40 flex items-start space-x-3 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-white tracking-tight">{toast.title}</h4>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Complete</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation & Actions Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUploadModal={() => {
          setIsUploaderOpen(true);
        }}
        onOpenAddWoModal={() => setActiveTab('workorders')}
        onResetData={handleResetData}
        onExportCsv={handleExportCsv}
        totalConflictsCount={totalConflictsCount}
        lastSavedTime={lastSavedTime}
        isCustomData={isCustomData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Location & Cutoff Date Slider Bar */}
        <GlobalFilterBar
          items={allAnalyzedItems}
          filters={globalFilters}
          onFilterChange={handleUpdateGlobalFilters}
          onResetGlobalFilters={handleResetGlobalFilters}
        />

        {/* KPI Dashboard Metrics */}
        <SummaryCards
          summary={summary}
          onFilterClick={handleSummaryCardFilterClick}
        />

        {/* Tab Views */}
        {activeTab === 'backorders' && (
          <BackOrderTable
            items={filteredAnalyzedItems}
            onSelectItem={setSelectedItem}
            onQuickCreateWo={handleQuickCreateWo}
            globalLocation={globalFilters.location}
            globalBrand={globalFilters.brand}
            globalItemType={globalFilters.itemType}
            globalCutoffDate={globalFilters.cutoffDate}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictAlerts
            items={filteredAnalyzedItems}
            workOrders={workOrders}
            onQuickCreateWo={handleQuickCreateWo}
            onSelectItem={setSelectedItem}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineGanttView
            items={filteredAnalyzedItems}
            workOrders={workOrders}
            onSelectItem={setSelectedItem}
          />
        )}

        {activeTab === 'workorders' && (
          <WorkOrdersManager
            workOrders={workOrders}
            onAddWorkOrder={handleAddWorkOrder}
            onDeleteWorkOrder={handleDeleteWorkOrder}
            onOpenUploadModal={() => {
              setUploaderTarget('workorders');
              setIsUploaderOpen(true);
            }}
          />
        )}
      </main>

      {/* CSV Uploader Modal */}
      <CsvUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        targetType={uploaderTarget}
        onImportCsvs={handleImportCsvs}
        onImportCsv={handleImportCsv}
      />

      {/* Single Item Analysis Modal */}
      <ItemDetailModal
        item={selectedItem}
        workOrders={workOrders}
        onClose={() => setSelectedItem(null)}
        onQuickCreateWo={handleQuickCreateWo}
      />
    </div>
  );
}
