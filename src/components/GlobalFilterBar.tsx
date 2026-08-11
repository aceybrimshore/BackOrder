import React, { useMemo, useState } from 'react';
import { MapPin, Calendar as CalendarIcon, Sliders, X, Check, Clock, Filter, ChevronLeft, ChevronRight, RotateCcw, Tag, Award } from 'lucide-react';
import { BackOrderItem, GlobalFilterState } from '../types';
import { ensureDate, parseFlexibleDate } from '../utils/csvParser';

interface GlobalFilterBarProps {
  items: BackOrderItem[];
  filters: GlobalFilterState;
  onFilterChange: (updated: Partial<GlobalFilterState>) => void;
  onResetGlobalFilters: () => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  items,
  filters,
  onFilterChange,
  onResetGlobalFilters
}) => {
  const [showCalendarWidget, setShowCalendarWidget] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    // Default to August 2026 (the main dataset month) or current filter year/month
    if (filters.cutoffDate) {
      const d = new Date(filters.cutoffDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 7, 1); // August 2026
  });

  // Extract unique locations and item counts per location
  const locationStats = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    let totalItems = 0;

    items.forEach(i => {
      if (i.isShippingOrNonInventory) return;
      totalItems++;
      const loc = i.location && i.location.trim() ? i.location.trim() : 'Unassigned';
      const existing = map.get(loc) || { count: 0, totalValue: 0 };
      existing.count++;
      existing.totalValue += i.backOrderValueExGst;
      map.set(loc, existing);
    });

    const list = Array.from(map.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.count - a.count);

    return { list, totalItems };
  }, [items]);

  // Extract unique brands and item counts per brand
  const brandStats = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    let totalItems = 0;

    items.forEach(i => {
      if (i.isShippingOrNonInventory) return;
      totalItems++;
      const brandName = i.brand && i.brand.trim() ? i.brand.trim() : 'Unassigned';
      const existing = map.get(brandName) || { count: 0, totalValue: 0 };
      existing.count++;
      existing.totalValue += i.backOrderValueExGst;
      map.set(brandName, existing);
    });

    const list = Array.from(map.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.count - a.count);

    return { list, totalItems };
  }, [items]);

  // Extract unique product types / categories and item counts
  const itemTypeStats = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    let totalItems = 0;

    items.forEach(i => {
      if (i.isShippingOrNonInventory) return;
      totalItems++;
      const typeName = (i.typeCategory || i.classCategory || 'Standard').trim();
      const existing = map.get(typeName) || { count: 0, totalValue: 0 };
      existing.count++;
      existing.totalValue += i.backOrderValueExGst;
      map.set(typeName, existing);
    });

    const list = Array.from(map.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.count - a.count);

    return { list, totalItems };
  }, [items]);

  // Extract min and max dates for the slider
  const dateRange = useMemo(() => {
    let minMs = Infinity;
    let maxMs = -Infinity;

    items.forEach(i => {
      const dObj = ensureDate(i.supplyRequiredDateParsed) || parseFlexibleDate(i.supplyRequiredByDate);
      if (dObj && !i.isShippingOrNonInventory) {
        const time = dObj.getTime();
        if (time < minMs) minMs = time;
        if (time > maxMs) maxMs = time;
      }
    });

    // Fallback if no parsed dates
    if (minMs === Infinity || maxMs === -Infinity) {
      const now = new Date('2026-08-01');
      const future = new Date('2026-12-31');
      return {
        minMs: now.getTime(),
        maxMs: future.getTime(),
        minDateStr: '2026-08-01',
        maxDateStr: '2026-12-31'
      };
    }

    const minDateStr = new Date(minMs).toISOString().split('T')[0];
    const maxDateStr = new Date(maxMs).toISOString().split('T')[0];

    return { minMs, maxMs, minDateStr, maxDateStr };
  }, [items]);

  // Map of backorder demand counts per ISO date (YYYY-MM-DD)
  const backorderCountsByDate = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(i => {
      const dObj = ensureDate(i.supplyRequiredDateParsed) || parseFlexibleDate(i.supplyRequiredByDate);
      if (!i.isShippingOrNonInventory && dObj) {
        const iso = dObj.toISOString().split('T')[0];
        map.set(iso, (map.get(iso) || 0) + 1);
      }
    });
    return map;
  }, [items]);

  // Convert current cutoffDate filter string to slider value (timestamp in ms)
  const currentSliderMs = useMemo(() => {
    if (!filters.cutoffDate) return dateRange.maxMs;
    const parsed = new Date(filters.cutoffDate);
    if (isNaN(parsed.getTime())) return dateRange.maxMs;
    return Math.min(dateRange.maxMs, Math.max(dateRange.minMs, parsed.getTime()));
  }, [filters.cutoffDate, dateRange]);

  // Compute metrics for current cutoffDate & location & brand & itemType selection
  const filteredMetrics = useMemo(() => {
    let count = 0;
    let totalQty = 0;
    let totalVal = 0;

    items.forEach(i => {
      if (i.isShippingOrNonInventory) return;

      // Location match
      if (filters.location !== 'ALL' && i.location !== filters.location) {
        return;
      }

      // Brand match
      if (filters.brand !== 'ALL') {
        const brandName = i.brand && i.brand.trim() ? i.brand.trim() : 'Unassigned';
        if (brandName !== filters.brand) {
          return;
        }
      }

      // Item Type match
      if (filters.itemType !== 'ALL') {
        const typeName = (i.typeCategory || i.classCategory || 'Standard').trim();
        if (typeName !== filters.itemType) {
          return;
        }
      }

      // Cutoff date match
      const dObj = ensureDate(i.supplyRequiredDateParsed) || parseFlexibleDate(i.supplyRequiredByDate);
      if (filters.cutoffDate && dObj) {
        const cutoffMs = new Date(filters.cutoffDate).getTime();
        if (dObj.getTime() > cutoffMs) {
          return;
        }
      }

      count++;
      totalQty += i.backOrderQty;
      totalVal += i.backOrderValueExGst;
    });

    return { count, totalQty, totalVal };
  }, [items, filters]);

  // Slider change handler
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valMs = Number(e.target.value);
    // If slider is at the far right max, clear cutoffDate
    if (valMs >= dateRange.maxMs) {
      onFilterChange({ cutoffDate: null });
    } else {
      const dateObj = new Date(valMs);
      const iso = dateObj.toISOString().split('T')[0];
      onFilterChange({ cutoffDate: iso });
    }
  };

  // Direct date picker change handler
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onFilterChange({ cutoffDate: null });
    } else {
      onFilterChange({ cutoffDate: val });
    }
  };

  // Format date helper (DD/MM/YYYY)
  const formatDateDisplay = (isoStr: string | null) => {
    if (!isoStr) return 'All Future Dates (No Limit)';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  // Preset date helpers relative to simulation timeline (Aug 2026)
  const setPresetDate = (isoDate: string | null) => {
    onFilterChange({ cutoffDate: isoDate });
  };

  const isFilterActive = filters.location !== 'ALL' || filters.brand !== 'ALL' || filters.itemType !== 'ALL' || filters.cutoffDate !== null;

  // Calendar Widget Grid Calculation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get day of week for 1st of month (0 = Sunday, convert to Monday = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const daysArr: Array<{ dateObj: Date; isoStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      const isoStr = prevDate.toISOString().split('T')[0];
      daysArr.push({ dateObj: prevDate, isoStr, dayNum: prevDate.getDate(), isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      // Format as YYYY-MM-DD
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const isoStr = `${year}-${mm}-${dd}`;
      daysArr.push({ dateObj: currDate, isoStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = (7 - (daysArr.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const isoStr = nextDate.toISOString().split('T')[0];
      daysArr.push({ dateObj: nextDate, isoStr, dayNum: nextDate.getDate(), isCurrentMonth: false });
    }

    return daysArr;
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white border border-amber-200/80 rounded-xl shadow-xs overflow-hidden">
      {/* Bar Header */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400 text-slate-900">
            <Sliders className="w-4 h-4 font-bold" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Location & Requirement Timeline Filters</span>
              {isFilterActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase">
                  Active Filter
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-300">
              Filter backorders by fulfillment facility or evaluate required volume up to a target deadline date
            </p>
          </div>
        </div>

        {/* Dynamic Metric Pill for current filter */}
        <div className="flex items-center space-x-3 text-xs bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="text-right">
            <div className="text-amber-400 font-bold">
              {filteredMetrics.count} Backorders Required
            </div>
            <div className="text-[10px] text-slate-300">
              {filteredMetrics.totalQty.toLocaleString()} units • ${filteredMetrics.totalVal.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
          {isFilterActive && (
            <button
              onClick={onResetGlobalFilters}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Reset all location & date filters"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Controls Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* SECTION 1: Location Filter & Quick Location Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Facility / Warehouse Location:</span>
            </label>
            {filters.location !== 'ALL' && (
              <button
                onClick={() => onFilterChange({ location: 'ALL' })}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
              >
                Clear Location Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Locations Pill */}
            <button
              onClick={() => onFilterChange({ location: 'ALL' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                filters.location === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All Locations</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${filters.location === 'ALL' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
                {locationStats.totalItems}
              </span>
            </button>

            {/* Individual Location Pills */}
            {locationStats.list.map(loc => {
              const isSelected = filters.location === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => onFilterChange({ location: loc.name })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{loc.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {loc.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Brand / Manufacturer Filter Pills */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Brand / Manufacturer:</span>
            </label>
            {filters.brand !== 'ALL' && (
              <button
                onClick={() => onFilterChange({ brand: 'ALL' })}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
              >
                Clear Brand Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Brands Pill */}
            <button
              onClick={() => onFilterChange({ brand: 'ALL' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                filters.brand === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All Brands</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${filters.brand === 'ALL' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
                {brandStats.totalItems}
              </span>
            </button>

            {/* Individual Brand Pills */}
            {brandStats.list.map(b => {
              const isSelected = filters.brand === b.name;
              return (
                <button
                  key={b.name}
                  onClick={() => onFilterChange({ brand: b.name })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Award className={`w-3 h-3 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{b.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Product / Item Type Filter Pills */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Product / Order Type Category:</span>
            </label>
            {filters.itemType !== 'ALL' && (
              <button
                onClick={() => onFilterChange({ itemType: 'ALL' })}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
              >
                Clear Type Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Types Pill */}
            <button
              onClick={() => onFilterChange({ itemType: 'ALL' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                filters.itemType === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All Types</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${filters.itemType === 'ALL' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
                {itemTypeStats.totalItems}
              </span>
            </button>

            {/* Individual Type Pills */}
            {itemTypeStats.list.map(t => {
              const isSelected = filters.itemType === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => onFilterChange({ itemType: t.name })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Tag className={`w-3 h-3 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{t.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Timeline Cutoff & Calendar Widget Controls */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Header Title & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">
                  Required Cutoff Date:
                </span>
              </div>

              {/* Native Date Picker Input */}
              <div className="flex items-center space-x-1.5">
                <input
                  type="date"
                  value={filters.cutoffDate || ''}
                  onChange={handleDateInputChange}
                  min={dateRange.minDateStr}
                  max={dateRange.maxDateStr}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />

                {/* Interactive Calendar Widget Toggle Button */}
                <button
                  onClick={() => setShowCalendarWidget(!showCalendarWidget)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition-all ${
                    showCalendarWidget
                      ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-2xs'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{showCalendarWidget ? 'Hide Calendar' : 'Open Calendar Widget'}</span>
                </button>
              </div>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono">
                📅 Deadline: {formatDateDisplay(filters.cutoffDate)}
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
              <button
                onClick={() => setPresetDate('2026-08-14')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  filters.cutoffDate === '2026-08-14'
                    ? 'bg-amber-500 text-slate-900 border-amber-500 font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                ⚡ 14 Aug 2026
              </button>
              <button
                onClick={() => setPresetDate('2026-08-31')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  filters.cutoffDate === '2026-08-31'
                    ? 'bg-amber-500 text-slate-900 border-amber-500 font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                📅 End Aug
              </button>
              <button
                onClick={() => setPresetDate('2026-09-30')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  filters.cutoffDate === '2026-09-30'
                    ? 'bg-amber-500 text-slate-900 border-amber-500 font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                🗓️ End Sep
              </button>
              <button
                onClick={() => setPresetDate('2026-10-31')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  filters.cutoffDate === '2026-10-31'
                    ? 'bg-amber-500 text-slate-900 border-amber-500 font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                🗓️ End Oct
              </button>
              {filters.cutoffDate !== null && (
                <button
                  onClick={() => setPresetDate(null)}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
                >
                  ♾️ Clear Limit
                </button>
              )}
            </div>
          </div>

          {/* EXPANDABLE INTERACTIVE CALENDAR WIDGET GRID */}
          {showCalendarWidget && (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-amber-500/40 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Calendar Month Header Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white tracking-wide">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCalendarMonth(new Date(2026, 7, 1))}
                    className="p-1 text-[11px] text-amber-400 hover:text-amber-300 hover:underline mr-2"
                    title="Jump to August 2026 simulation"
                  >
                    Aug 2026
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span className="text-amber-400/80">Sa</span>
                <span className="text-amber-400/80">Su</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {calendarDays.map((day, idx) => {
                  const boCount = backorderCountsByDate.get(day.isoStr) || 0;
                  const isSelected = filters.cutoffDate === day.isoStr;
                  const isCutoffPassed = filters.cutoffDate && new Date(day.isoStr).getTime() <= new Date(filters.cutoffDate).getTime();

                  return (
                    <button
                      key={`${day.isoStr}-${idx}`}
                      onClick={() => {
                        onFilterChange({ cutoffDate: day.isoStr });
                      }}
                      className={`relative p-2 rounded-lg flex flex-col items-center justify-between h-12 transition-all border ${
                        !day.isCurrentMonth
                          ? 'text-slate-600 border-transparent hover:bg-slate-800/40'
                          : isSelected
                          ? 'bg-amber-400 text-slate-900 border-amber-300 font-extrabold ring-2 ring-amber-300 shadow-md scale-105 z-10'
                          : isCutoffPassed
                          ? 'bg-amber-950/40 text-amber-100 border-amber-800/50 hover:bg-amber-900/60'
                          : 'bg-slate-800 text-slate-200 border-slate-700/60 hover:bg-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-[11px] font-mono leading-none">{day.dayNum}</span>

                      {/* Backorder Demand Marker Badge */}
                      {boCount > 0 && (
                        <span
                          className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono leading-none ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'bg-amber-400 text-slate-900'
                          }`}
                          title={`${boCount} backorders required on this date`}
                        >
                          {boCount} BO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend & Help Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span>Required Date Demand Badge</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-800 inline-block"></span>
                    <span>Included in Current Cutoff</span>
                  </span>
                </div>
                {filters.cutoffDate && (
                  <button
                    onClick={() => onFilterChange({ cutoffDate: null })}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Calendar Cutoff Filter</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Slider Control Bar */}
          <div className="relative pt-1">
            <input
              type="range"
              min={dateRange.minMs}
              max={dateRange.maxMs}
              step={86400000} // 1 day in ms
              value={currentSliderMs}
              onChange={handleSliderChange}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
            />

            {/* Slider Min / Max Labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 font-medium">
              <span>Min Date: {formatDateDisplay(dateRange.minDateStr)}</span>
              <span className="text-center font-bold text-amber-700">
                {filters.cutoffDate ? `Cutoff Target: ${formatDateDisplay(filters.cutoffDate)}` : 'Drag slider left or use Calendar Widget to set date'}
              </span>
              <span>Max Date: {formatDateDisplay(dateRange.maxDateStr)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

