import React from 'react';
import { X, Package, Calendar, Factory, AlertTriangle, CheckCircle2, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { BackOrderItem, WorkOrder } from '../types';

interface ItemDetailModalProps {
  item: BackOrderItem | null;
  workOrders: WorkOrder[];
  onClose: () => void;
  onQuickCreateWo: (item: BackOrderItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  workOrders,
  onClose,
  onQuickCreateWo
}) => {
  if (!item) return null;

  const matchingWos = workOrders.filter(
    wo => wo.item.trim().toUpperCase() === item.item.trim().toUpperCase()
  );

  const totalWoQty = matchingWos.reduce((sum, w) => sum + w.scheduledQty, 0);
  const isNoWo = item.conflictStatus === 'NO_WORK_ORDER';
  const isLate = item.conflictStatus === 'SCHEDULE_CONFLICT';
  const isShortage = item.conflictStatus === 'QUANTITY_SHORTAGE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-bold text-amber-400">{item.item}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                {item.brand || 'Unbranded'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              SO Number: <strong>{item.documentNumber || 'N/A'}</strong> · Customer PO: <strong>{item.customerPo || 'N/A'}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800">
          {/* Conflict Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              isNoWo
                ? 'bg-red-50 border-red-200 text-red-900'
                : isLate || isShortage
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {isNoWo ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : isLate || isShortage ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h4 className="font-bold text-sm">
                Production Status: {item.conflictStatus.replace(/_/g, ' ')}
              </h4>
              <p className="mt-0.5 font-medium leading-relaxed">
                {item.conflictDetails}
              </p>
            </div>

            {(isNoWo || isLate || isShortage) && (
              <button
                onClick={() => {
                  onQuickCreateWo(item);
                  onClose();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-lg shrink-0 shadow-2xs transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule WO</span>
              </button>
            )}
          </div>

          {/* Key Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Backorder Qty</span>
              <span className="text-sm font-bold text-slate-900">{item.backOrderQty.toLocaleString()} units</span>
            </div>

            <div>
              <span className="text-slate-500 block">Required Date</span>
              <span className="text-sm font-bold text-slate-900">{item.supplyRequiredByDate || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Order Value (Ex GST)</span>
              <span className="text-sm font-bold text-slate-900">
                ${item.backOrderValueExGst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Urgency Rating</span>
              <span className={`text-xs font-bold uppercase ${item.urgency === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>
                {item.urgency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Customer Name</span>
              <span className="font-semibold text-slate-900">{item.customerName}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Warehouse Location</span>
              <span className="font-semibold text-slate-900">{item.location || 'Sydney'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Category Class</span>
              <span className="font-semibold text-slate-900">{item.classCategory || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Inventory Type</span>
              <span className="font-semibold text-slate-900">{item.inventoryType || 'N/A'}</span>
            </div>
          </div>

          {/* Scheduled Work Orders Matching this SKU */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-amber-500" />
                <span>Scheduled Work Orders for {item.item} ({matchingWos.length})</span>
              </h4>

              <span className="text-xs text-slate-500">
                Total WO Qty: <strong className="text-slate-900">{totalWoQty.toLocaleString()} units</strong>
              </span>
            </div>

            {matchingWos.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 italic">
                No work orders currently scheduled for this SKU in the system.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {matchingWos.map(wo => (
                  <div key={wo.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-slate-900 text-xs flex items-center space-x-2">
                        <span>{wo.woNumber}</span>
                        <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-sans font-medium">
                          {wo.workCenter || 'Assembly'}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Completion Date: <strong className="text-slate-800">{wo.scheduledDate}</strong> · Qty: <strong className="text-slate-800">{wo.scheduledQty}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="px-2 py-1 rounded bg-slate-100 font-bold text-slate-700 text-[11px]">
                        {wo.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
