import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, PackageX, ExternalLink, ShieldAlert } from 'lucide-react';
import { BackOrderItem, FilterState, UrgencyLevel, ConflictStatus } from '../types';

interface BackOrderTableProps {
  items: BackOrderItem[];
  onSelectItem: (item: BackOrderItem) => void;
  onQuickCreateWo: (item: BackOrderItem) => void;
  initialFilterStatus?: string;
  globalLocation?: string;
  globalBrand?: string;
  globalItemType?: string;
  globalCutoffDate?: string | null;
}

export const BackOrderTable: React.FC<BackOrderTableProps> = ({
  items,
  onSelectItem,
  onQuickCreateWo,
  initialFilterStatus,
  globalLocation = 'ALL',
  globalBrand = 'ALL',
  globalItemType = 'ALL',
  globalCutoffDate = null
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    urgency: 'ALL',
    conflictStatus: initialFilterStatus || 'ALL',
    brand: globalBrand,
    location: globalLocation,
    itemType: globalItemType,
    cutoffDate: globalCutoffDate,
    excludeShippingNonInventory: true,
    sortBy: 'urgency',
    sortOrder: 'desc'
  });

  // Sync internal state if global props change
  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      location: globalLocation,
      brand: globalBrand,
      itemType: globalItemType,
      cutoffDate: globalCutoffDate
    }));
  }, [globalLocation, globalBrand, globalItemType, globalCutoffDate]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract unique Brands, Locations, and Item Types
  const brands = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.brand && i.brand.trim()) set.add(i.brand.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.location && i.location.trim()) set.add(i.location.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  const itemTypes = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      const typeStr = (i.typeCategory || i.classCategory || 'Standard').trim();
      if (typeStr) set.add(typeStr);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Exclude Shipping / Non-Inventory if toggled
      if (filters.excludeShippingNonInventory && item.isShippingOrNonInventory) {
        return false;
      }

      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesSku = item.item.toLowerCase().includes(q);
        const matchesCustomer = item.customerName.toLowerCase().includes(q);
        const matchesDoc = item.documentNumber.toLowerCase().includes(q);
        const matchesPo = item.customerPo.toLowerCase().includes(q);
        if (!matchesSku && !matchesCustomer && !matchesDoc && !matchesPo) return false;
      }

      // Urgency filter
      if (filters.urgency !== 'ALL' && item.urgency !== filters.urgency) {
        return false;
      }

      // Conflict filter
      if (filters.conflictStatus !== 'ALL') {
        if (filters.conflictStatus === 'CONFLICTS') {
          if (item.conflictStatus === 'COVERED' || item.conflictStatus === 'EXEMPT') return false;
        } else if (item.conflictStatus !== filters.conflictStatus) {
          return false;
        }
      }

      // Brand filter
      if (filters.brand !== 'ALL' && item.brand !== filters.brand) {
        return false;
      }

      // Location filter
      if (filters.location !== 'ALL' && item.location !== filters.location) {
        return false;
      }

      // Item Type filter
      if (filters.itemType !== 'ALL') {
        const typeStr = (item.typeCategory || item.classCategory || 'Standard').trim();
        if (typeStr !== filters.itemType) {
          return false;
        }
      }

      // Cutoff Date filter
      if (filters.cutoffDate && item.supplyRequiredDateParsed) {
        const cutoffMs = new Date(filters.cutoffDate).getTime();
        if (item.supplyRequiredDateParsed.getTime() > cutoffMs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      if (filters.sortBy === 'urgency') {
        const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (rank[b.urgency] - rank[a.urgency]) * order;
      }

      if (filters.sortBy === 'value') {
        return (a.backOrderValueExGst - b.backOrderValueExGst) * order;
      }

      if (filters.sortBy === 'qty') {
        return (a.backOrderQty - b.backOrderQty) * order;
      }

      if (filters.sortBy === 'requiredDate') {
        const dA = a.supplyRequiredDateParsed ? a.supplyRequiredDateParsed.getTime() : Infinity;
        const dB = b.supplyRequiredDateParsed ? b.supplyRequiredDateParsed.getTime() : Infinity;
        return (dA - dB) * order;
      }

      if (filters.sortBy === 'item') {
        return a.item.localeCompare(b.item) * order;
      }

      return 0;
    });
  }, [items, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const toggleSort = (field: FilterState['sortBy']) => {
    if (filters.sortBy === field) {
      setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      setFilters(prev => ({ ...prev, sortBy: field, sortOrder: 'desc' }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Search & Filters Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by SKU, Customer, SO#, PO#..."
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Non-Inventory Toggle */}
          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.excludeShippingNonInventory}
              onChange={e => {
                setFilters(prev => ({ ...prev, excludeShippingNonInventory: e.target.checked }));
                setCurrentPage(1);
              }}
              className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-slate-300"
            />
            <span>Exclude Shipping & Non-Inventory Lines</span>
          </label>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Urgency Filter */}
          <select
            value={filters.urgency}
            onChange={e => {
              setFilters(prev => ({ ...prev, urgency: e.target.value }));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Urgency Levels</option>
            <option value="CRITICAL">🔴 Critical / Overdue</option>
            <option value="HIGH">🟠 High Priority</option>
            <option value="MEDIUM">🟡 Medium Priority</option>
            <option value="LOW">🟢 Low Priority</option>
          </select>

          {/* Conflict Filter */}
          <select
            value={filters.conflictStatus}
            onChange={e => {
              setFilters(prev => ({ ...prev, conflictStatus: e.target.value }));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="ALL">All WO Conflict Statuses</option>
            <option value="CONFLICTS">⚠️ Any Conflict / Missing WO</option>
            <option value="NO_WORK_ORDER">🔴 No Work Order</option>
            <option value="SCHEDULE_CONFLICT">⚠️ Schedule Late Conflict</option>
            <option value="QUANTITY_SHORTAGE">📉 Quantity Shortage</option>
            <option value="COVERED">🟢 Covered by WO</option>
          </select>

          {/* Brand Filter */}
          <select
            value={filters.brand}
            onChange={e => {
              setFilters(prev => ({ ...prev, brand: e.target.value }));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Brands</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filters.location}
            onChange={e => {
              setFilters(prev => ({ ...prev, location: e.target.value }));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Item Type Filter */}
          <select
            value={filters.itemType}
            onChange={e => {
              setFilters(prev => ({ ...prev, itemType: e.target.value }));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Item Types</option>
            {itemTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="ml-auto text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredItems.length}</strong> items
          </div>
        </div>
      </div>

      {/* Main Backorder Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider select-none">
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('urgency')} className="flex items-center space-x-1 hover:text-slate-900">
                  <span>Urgency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('item')} className="flex items-center space-x-1 hover:text-slate-900">
                  <span>SKU / Item</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('qty')} className="flex items-center space-x-1 hover:text-slate-900">
                  <span>BO Qty</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('requiredDate')} className="flex items-center space-x-1 hover:text-slate-900">
                  <span>Required Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Work Order Status</th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('value')} className="flex items-center space-x-1 hover:text-slate-900">
                  <span>Order Value</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500">
                  No backorder items match your search or filters.
                </td>
              </tr>
            ) : (
              paginatedItems.map(item => {
                const isCritical = item.urgency === 'CRITICAL';
                const isNoWo = item.conflictStatus === 'NO_WORK_ORDER';
                const isConflict = item.conflictStatus === 'SCHEDULE_CONFLICT';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Urgency Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : item.urgency === 'HIGH'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : item.urgency === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>

                    {/* SKU / Item */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="hover:text-amber-600 hover:underline text-left"
                      >
                        {item.item}
                      </button>
                      <div className="text-[10px] text-slate-400 font-sans font-normal">
                        Doc: {item.documentNumber}
                      </div>
                    </td>

                    {/* Item Type */}
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold">
                        {item.typeCategory || item.classCategory || 'Standard'}
                      </span>
                    </td>

                    {/* Back Order Qty */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.backOrderQty.toLocaleString()}
                    </td>

                    {/* Supply Required Date */}
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {item.supplyRequiredByDate || 'N/A'}
                    </td>

                    {/* Work Order Conflict Status Badge */}
                    <td className="py-3 px-4 max-w-xs">
                      {item.isShippingOrNonInventory ? (
                        <span className="text-slate-400 italic">Non-inventory</span>
                      ) : isNoWo ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200">
                          <PackageX className="w-3 h-3 text-red-600" />
                          <span>No Work Order</span>
                        </span>
                      ) : isConflict ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Late Completion</span>
                        </span>
                      ) : item.conflictStatus === 'QUANTITY_SHORTAGE' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-bold border border-yellow-200">
                          <span>Qty Shortage</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>WO Scheduled</span>
                        </span>
                      )}
                    </td>

                    {/* Order Value */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      ${item.backOrderValueExGst.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 font-medium text-amber-900 whitespace-nowrap">
                      <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-semibold text-[11px]">
                        📍 {item.location || 'Unassigned'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={item.customerName}>
                      {item.customerName}
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {item.brand || 'Other'}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        {!item.isShippingOrNonInventory && (isNoWo || isConflict) && (
                          <button
                            onClick={() => onQuickCreateWo(item)}
                            className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded text-[11px] transition-colors"
                            title="Create scheduled Work Order for this SKU"
                          >
                            + WO
                          </button>
                        )}
                        <button
                          onClick={() => onSelectItem(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="View Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
