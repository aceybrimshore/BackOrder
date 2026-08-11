import React, { useMemo } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, PackageX } from 'lucide-react';
import { BackOrderItem, WorkOrder } from '../types';
import { ensureDate, parseFlexibleDate } from '../utils/csvParser';

interface TimelineGanttViewProps {
  items: BackOrderItem[];
  workOrders: WorkOrder[];
  onSelectItem: (item: BackOrderItem) => void;
}

export const TimelineGanttView: React.FC<TimelineGanttViewProps> = ({
  items,
  workOrders,
  onSelectItem
}) => {
  // Group back orders and work orders by SKU
  const skuGroups = useMemo(() => {
    const invItems = items.filter(i => !i.isShippingOrNonInventory);
    const map = new Map<
      string,
      {
        sku: string;
        brand: string;
        totalBoQty: number;
        totalBoValue: number;
        earliestRequiredDate: Date | null;
        earliestRequiredStr: string;
        backOrders: BackOrderItem[];
        matchingWos: WorkOrder[];
        hasWo: boolean;
        isConflict: boolean;
      }
    >();

    invItems.forEach(bo => {
      const sku = bo.item.trim().toUpperCase();
      if (!map.has(sku)) {
        map.set(sku, {
          sku,
          brand: bo.brand,
          totalBoQty: 0,
          totalBoValue: 0,
          earliestRequiredDate: null,
          earliestRequiredStr: '',
          backOrders: [],
          matchingWos: [],
          hasWo: false,
          isConflict: false
        });
      }

      const entry = map.get(sku)!;
      entry.totalBoQty += bo.backOrderQty;
      entry.totalBoValue += bo.backOrderValueExGst;
      entry.backOrders.push(bo);

      const boDate = ensureDate(bo.supplyRequiredDateParsed) || parseFlexibleDate(bo.supplyRequiredByDate);
      if (boDate) {
        if (!entry.earliestRequiredDate || boDate.getTime() < entry.earliestRequiredDate.getTime()) {
          entry.earliestRequiredDate = boDate;
          entry.earliestRequiredStr = bo.supplyRequiredByDate;
        }
      }
    });

    // Attach Work Orders
    workOrders.forEach(wo => {
      const sku = wo.item.trim().toUpperCase();
      if (map.has(sku)) {
        const entry = map.get(sku)!;
        entry.matchingWos.push(wo);
        entry.hasWo = true;
      }
    });

    // Flag conflicts
    map.forEach(entry => {
      if (!entry.hasWo) {
        entry.isConflict = true;
      } else {
        const totalWoQty = entry.matchingWos.reduce((s, w) => s + w.scheduledQty, 0);
        const earliestWoDateMs = entry.matchingWos
          .map(w => {
            const d = ensureDate(w.scheduledDateParsed) || parseFlexibleDate(w.scheduledDate);
            return d ? d.getTime() : Infinity;
          })
          .sort((a, b) => a - b)[0];

        const reqMs = entry.earliestRequiredDate?.getTime() || Infinity;
        if (earliestWoDateMs > reqMs || totalWoQty < entry.totalBoQty) {
          entry.isConflict = true;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      // Conflicts first, then highest value
      if (a.isConflict && !b.isConflict) return -1;
      if (!a.isConflict && b.isConflict) return 1;
      return b.totalBoValue - a.totalBoValue;
    });
  }, [items, workOrders]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Production Timeline vs Backorder Demand</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Visual comparison of customer supply required dates against scheduled work order completions
          </p>
        </div>

        <div className="text-xs text-slate-300 flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span>Backorder Required Date</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Work Order Completion</span>
          </span>
        </div>
      </div>

      {/* Gantt List */}
      <div className="p-4 sm:p-6 divide-y divide-slate-100">
        {skuGroups.map(group => {
          const mainBo = group.backOrders[0];

          return (
            <div key={group.sku} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                {/* SKU Info */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => mainBo && onSelectItem(mainBo)}
                    className="text-sm font-mono font-bold text-slate-900 hover:text-amber-600 hover:underline"
                  >
                    {group.sku}
                  </button>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                    {group.brand}
                  </span>
                  <span className="text-xs text-slate-500">
                    Required Qty: <strong className="text-slate-900">{group.totalBoQty.toLocaleString()} units</strong>
                  </span>
                  <span className="text-xs text-slate-500">
                    Val: <strong className="text-slate-900">${group.totalBoValue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</strong>
                  </span>
                </div>

                {/* Status Badge */}
                <div>
                  {!group.hasWo ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 inline-flex items-center space-x-1">
                      <PackageX className="w-3.5 h-3.5" />
                      <span>NO WORK ORDER IN SYSTEM</span>
                    </span>
                  ) : group.isConflict ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>TIMELINE CONFLICT / SHORTAGE</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ON SCHEDULE & COVERED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline Graphic Bar */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                {/* Backorder Demand Row */}
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold text-slate-600 shrink-0">
                    Supply Required:
                  </span>
                  <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 flex items-center justify-between font-mono text-slate-900">
                    <span className="font-semibold text-red-600">
                      📅 {group.earliestRequiredStr || 'N/A'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {group.backOrders.length} active backorder document(s)
                    </span>
                  </div>
                </div>

                {/* Work Order Rows */}
                {group.matchingWos.length === 0 ? (
                  <div className="flex items-center gap-3 text-red-600 font-medium italic">
                    <span className="w-32 shrink-0">Work Orders:</span>
                    <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded border border-red-200 flex-1">
                      ⚠️ No production work orders exist for part {group.sku}. Production stoptage / delay risk!
                    </span>
                  </div>
                ) : (
                  group.matchingWos.map(wo => {
                    const woDate = ensureDate(wo.scheduledDateParsed) || parseFlexibleDate(wo.scheduledDate);
                    const isLate =
                      group.earliestRequiredDate &&
                      woDate &&
                      woDate.getTime() > group.earliestRequiredDate.getTime();

                    return (
                      <div key={wo.id} className="flex items-center gap-3">
                        <span className="w-32 font-semibold text-slate-600 shrink-0 font-mono">
                          {wo.woNumber}:
                        </span>
                        <div
                          className={`flex-1 rounded px-3 py-1.5 border flex items-center justify-between ${
                            isLate
                              ? 'bg-red-50 text-red-900 border-red-200 font-bold'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>📦 Qty: {wo.scheduledQty.toLocaleString()} units</span>
                            <span>•</span>
                            <span>Ready: {wo.scheduledDate}</span>
                            <span>({wo.status})</span>
                          </div>

                          {isLate && (
                            <span className="text-red-700 text-[11px] font-bold bg-red-100 px-2 py-0.5 rounded">
                              LATE BY TIMELINE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
