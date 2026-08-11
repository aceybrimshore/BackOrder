import React from 'react';
import { AlertOctagon, Calendar, Plus, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { BackOrderItem, WorkOrder } from '../types';

interface ConflictAlertsProps {
  items: BackOrderItem[];
  workOrders: WorkOrder[];
  onQuickCreateWo: (item: BackOrderItem) => void;
  onSelectItem: (item: BackOrderItem) => void;
}

export const ConflictAlerts: React.FC<ConflictAlertsProps> = ({
  items,
  workOrders,
  onQuickCreateWo,
  onSelectItem
}) => {
  // Filter items that have real conflict issues or critical urgency
  const conflictItems = items.filter(
    item => !item.isShippingOrNonInventory && (
      item.conflictStatus === 'NO_WORK_ORDER' ||
      item.conflictStatus === 'SCHEDULE_CONFLICT' ||
      item.conflictStatus === 'QUANTITY_SHORTAGE'
    )
  ).sort((a, b) => {
    // Sort critical urgency first, then highest backorder value
    if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
    if (b.urgency === 'CRITICAL' && a.urgency !== 'CRITICAL') return 1;
    return b.backOrderValueExGst - a.backOrderValueExGst;
  });

  if (conflictItems.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-2xs">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-emerald-900">All Back Orders Fully Covered by Production</h3>
        <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
          No scheduled work order timeline conflicts or missing work orders detected for current backorders.
        </p>
      </div>
    );
  }

  const noWoCount = conflictItems.filter(i => i.conflictStatus === 'NO_WORK_ORDER').length;
  const scheduleConflictCount = conflictItems.filter(i => i.conflictStatus === 'SCHEDULE_CONFLICT').length;
  const shortageCount = conflictItems.filter(i => i.conflictStatus === 'QUANTITY_SHORTAGE').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Alert Header */}
      <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Action Required: Production Conflicts & Missing WOs
            </h2>
            <p className="text-xs text-slate-300">
              {conflictItems.length} backordered parts require production scheduling or date adjustment to avoid customer delivery delays
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {noWoCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 font-semibold">
              🔴 {noWoCount} No Work Order
            </span>
          )}
          {scheduleConflictCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
              ⚠️ {scheduleConflictCount} Late Schedule
            </span>
          )}
          {shortageCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold">
              📉 {shortageCount} Qty Shortage
            </span>
          )}
        </div>
      </div>

      {/* Conflict List Cards */}
      <div className="p-4 sm:p-6 divide-y divide-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conflictItems.map(item => {
            const isNoWo = item.conflictStatus === 'NO_WORK_ORDER';
            const isLate = item.conflictStatus === 'SCHEDULE_CONFLICT';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isNoWo
                    ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                    : isLate
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* SKU & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button
                        onClick={() => onSelectItem(item)}
                        className="text-sm font-bold text-slate-900 hover:text-amber-600 hover:underline text-left font-mono"
                      >
                        {item.item}
                      </button>
                      <div className="text-xs text-slate-500 font-medium">
                        Brand: <span className="text-slate-800 font-semibold">{item.brand || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isNoWo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase">
                          No Work Order
                        </span>
                      )}
                      {isLate && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          Late WO Completion
                        </span>
                      )}
                      {item.conflictStatus === 'QUANTITY_SHORTAGE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">
                          Qty Shortage
                        </span>
                      )}

                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : item.urgency === 'HIGH'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Value Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Backorder Qty:</span>
                      <span className="font-bold text-slate-900">{item.backOrderQty.toLocaleString()} units</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Required By Date:</span>
                      <span className="font-bold text-slate-900">{item.supplyRequiredByDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded inline-block">
                        📍 {item.location || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Order Value:</span>
                      <span className="font-bold text-slate-900">
                        ${item.backOrderValueExGst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Customer:</span>
                      <span className="font-medium text-slate-800 truncate block" title={item.customerName}>
                        {item.customerName}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Conflict Reason */}
                  <p className="mt-2 text-xs text-slate-600 leading-snug font-medium">
                    {item.conflictDetails}
                  </p>
                </div>

                {/* Quick Resolution Actions */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onQuickCreateWo(item)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Create WO</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
