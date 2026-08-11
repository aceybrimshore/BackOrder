import React, { useState } from 'react';
import { Search, Plus, Trash2, Calendar, Factory, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { WorkOrder } from '../types';

interface WorkOrdersManagerProps {
  workOrders: WorkOrder[];
  onAddWorkOrder: (wo: Omit<WorkOrder, 'id'>) => void;
  onDeleteWorkOrder: (id: string) => void;
  onOpenUploadModal: () => void;
}

export const WorkOrdersManager: React.FC<WorkOrdersManagerProps> = ({
  workOrders,
  onAddWorkOrder,
  onDeleteWorkOrder,
  onOpenUploadModal
}) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New WO form state
  const [woNumber, setWoNumber] = useState(`WO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itemSku, setItemSku] = useState('');
  const [scheduledQty, setScheduledQty] = useState(100);
  const [scheduledDate, setScheduledDate] = useState('2026-08-30');
  const [workCenter, setWorkCenter] = useState('Assembly Line 1');
  const [status, setStatus] = useState<WorkOrder['status']>('Scheduled');
  const [notes, setNotes] = useState('');

  const filtered = workOrders.filter(wo => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      wo.woNumber.toLowerCase().includes(q) ||
      wo.item.toLowerCase().includes(q) ||
      (wo.workCenter && wo.workCenter.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemSku.trim() || !woNumber.trim()) return;

    // Parse date into DD/MM/YYYY for uniform display
    let formattedDate = scheduledDate;
    if (scheduledDate.includes('-')) {
      const [y, m, d] = scheduledDate.split('-');
      formattedDate = `${d}/${m}/${y}`;
    }

    onAddWorkOrder({
      woNumber: woNumber.trim(),
      item: itemSku.trim().toUpperCase(),
      scheduledQty: Number(scheduledQty) || 0,
      scheduledDate: formattedDate,
      scheduledDateParsed: new Date(scheduledDate),
      status,
      workCenter,
      notes
    });

    // Reset
    setShowAddForm(false);
    setItemSku('');
    setScheduledQty(100);
    setWoNumber(`WO-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-400" />
            <span>Scheduled Work Orders ({workOrders.length})</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Production schedules cross-referenced against backorder dates to highlight fulfillment gaps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload WO CSV</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Work Order'}</span>
          </button>
        </div>
      </div>

      {/* Manual WO Entry Form Modal/Accordion */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-amber-50/50 border-b border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Create New Scheduled Work Order
            </h3>
            <span className="text-xs text-slate-500">Auto-updates conflict detection upon save</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">WO Number</label>
              <input
                type="text"
                required
                value={woNumber}
                onChange={e => setWoNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Part SKU / Item</label>
              <input
                type="text"
                required
                placeholder="e.g. MTX02BKP or PZQ3012210"
                value={itemSku}
                onChange={e => setItemSku(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Scheduled Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={scheduledQty}
                onChange={e => setScheduledQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Completion Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Work Center / Line</label>
              <select
                value={workCenter}
                onChange={e => setWorkCenter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value="Assembly Line 1">Assembly Line 1</option>
                <option value="Assembly Line 2">Assembly Line 2</option>
                <option value="Maxtrax Line 1">Maxtrax Line 1</option>
                <option value="Rack Molding Cell">Rack Molding Cell</option>
                <option value="Tred Production">Tred Production</option>
                <option value="Extrusion Line">Extrusion Line</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WorkOrder['status'])}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Planned">Planned</option>
                <option value="Released">Released</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Notes / Description</label>
              <input
                type="text"
                placeholder="Optional notes or batch info"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-slate-900 bg-amber-400 hover:bg-amber-300 text-xs font-bold shadow-2xs"
            >
              Save & Recalculate Conflicts
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search work orders by WO#, SKU, or Line..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-4">WO Number</th>
              <th className="py-3 px-4">Part SKU</th>
              <th className="py-3 px-4">Scheduled Qty</th>
              <th className="py-3 px-4">Completion Date</th>
              <th className="py-3 px-4">Work Center</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No work orders found. Click "+ Add Work Order" above to schedule production for backordered parts.
                </td>
              </tr>
            ) : (
              filtered.map(wo => (
                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {wo.woNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {wo.item}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {wo.scheduledQty.toLocaleString()} units
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {wo.scheduledDate}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {wo.workCenter || 'Assembly Line 1'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        wo.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wo.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : wo.status === 'Released'
                          ? 'bg-purple-100 text-purple-800'
                          : wo.status === 'Delayed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {wo.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={wo.notes}>
                    {wo.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteWorkOrder(wo.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Work Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
