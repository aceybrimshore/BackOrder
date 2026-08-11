import { BackOrderItem, WorkOrder, ConflictStatus, UrgencyLevel, ItemAnalysisSummary } from '../types';
import { ensureDate, parseFlexibleDate } from './csvParser';

// Reference date for simulation / evaluation (defaults to current date if not forced)
const CURRENT_SIMULATION_DATE = new Date('2026-08-06');

/**
 * Calculates Urgency Level and Conflict Status for each back order item
 */
export function analyzeBackOrders(
  rawItems: Partial<BackOrderItem>[],
  workOrders: WorkOrder[],
  referenceDate: Date = CURRENT_SIMULATION_DATE
): BackOrderItem[] {
  // Map of work orders grouped by item SKU
  const woMap = new Map<string, WorkOrder[]>();
  for (const wo of workOrders) {
    const sku = wo.item.trim().toUpperCase();
    if (!woMap.has(sku)) woMap.set(sku, []);
    woMap.get(sku)!.push(wo);
  }

  const todayMs = referenceDate.getTime();

  return rawItems.map((raw, index) => {
    const itemSku = raw.item?.trim().toUpperCase() || 'UNKNOWN';
    const reqDate = ensureDate(raw.supplyRequiredDateParsed) || parseFlexibleDate(raw.supplyRequiredByDate);
    const value = raw.backOrderValueExGst || 0;
    const isNonInv = !!raw.isShippingOrNonInventory;

    // 1. Calculate Urgency
    let urgency: UrgencyLevel = 'LOW';
    let urgencyReason = 'Standard supply timeline';

    if (isNonInv) {
      urgency = 'LOW';
      urgencyReason = 'Shipping / Non-inventory line';
    } else if (reqDate) {
      const diffDays = Math.ceil((reqDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        urgency = 'CRITICAL';
        urgencyReason = `OVERDUE by ${Math.abs(diffDays)} day(s)! Required by ${raw.supplyRequiredByDate}`;
      } else if (diffDays <= 14) {
        urgency = 'CRITICAL';
        urgencyReason = `Due imminently in ${diffDays} day(s) (${raw.supplyRequiredByDate})`;
      } else if (diffDays <= 30) {
        urgency = 'HIGH';
        urgencyReason = `Due within 30 days (${diffDays} days away)`;
      } else if (diffDays <= 60) {
        urgency = 'MEDIUM';
        urgencyReason = `Due within 60 days (${diffDays} days away)`;
      } else {
        urgency = 'LOW';
        urgencyReason = `Required far in future (${diffDays} days away)`;
      }
    }

    // High value boost
    if (!isNonInv && value >= 50000) {
      urgency = 'CRITICAL';
      urgencyReason += ` | High Value Order ($${value.toLocaleString('en-AU', { minimumFractionDigits: 2 })})`;
    } else if (!isNonInv && value >= 15000 && urgency === 'LOW') {
      urgency = 'MEDIUM';
      urgencyReason += ` | Significant Value ($${value.toLocaleString('en-AU', { minimumFractionDigits: 2 })})`;
    }

    // 2. Evaluate Work Order Conflicts
    let conflictStatus: ConflictStatus = 'EXEMPT';
    let conflictDetails = 'Non-inventory or shipping item';

    if (!isNonInv) {
      const matchingWos = woMap.get(itemSku) || [];

      if (matchingWos.length === 0) {
        conflictStatus = 'NO_WORK_ORDER';
        conflictDetails = '⚠️ NO work orders scheduled in system for this part!';
      } else {
        // Total WO Qty scheduled
        const totalWoQty = matchingWos.reduce((sum, wo) => sum + wo.scheduledQty, 0);
        
        // Find earliest completion date among non-completed WOs
        const validWos = matchingWos.filter(w => w.status !== 'Completed');
        const activeWos = validWos.length > 0 ? validWos : matchingWos;
        
        const sortedWos = [...activeWos].sort((a, b) => {
          const dateA = ensureDate(a.scheduledDateParsed) || parseFlexibleDate(a.scheduledDate);
          const dateB = ensureDate(b.scheduledDateParsed) || parseFlexibleDate(b.scheduledDate);
          const dA = dateA ? dateA.getTime() : Infinity;
          const dB = dateB ? dateB.getTime() : Infinity;
          return dA - dB;
        });

        const earliestWo = sortedWos[0];
        const earliestWoDate = earliestWo ? (ensureDate(earliestWo.scheduledDateParsed) || parseFlexibleDate(earliestWo.scheduledDate)) : null;
        const boQty = raw.backOrderQty || 0;

        if (reqDate && earliestWo && earliestWoDate) {
          if (earliestWoDate.getTime() > reqDate.getTime()) {
            conflictStatus = 'SCHEDULE_CONFLICT';
            const lagDays = Math.ceil((earliestWoDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24));
            conflictDetails = `🔴 Earliest WO (${earliestWo.woNumber}) finishes on ${earliestWo.scheduledDate}, which is ${lagDays} day(s) AFTER required date (${raw.supplyRequiredByDate})`;
          } else if (totalWoQty < boQty) {
            conflictStatus = 'QUANTITY_SHORTAGE';
            conflictDetails = `⚠️ Scheduled WO Qty (${totalWoQty}) is less than Back Order Qty required (${boQty}). Shortage of ${boQty - totalWoQty} units.`;
          } else {
            conflictStatus = 'COVERED';
            conflictDetails = `🟢 Scheduled WO (${earliestWo.woNumber}) on ${earliestWo.scheduledDate} covers ${totalWoQty} units (BO: ${boQty})`;
          }
        } else if (totalWoQty < boQty) {
          conflictStatus = 'QUANTITY_SHORTAGE';
          conflictDetails = `⚠️ Scheduled WO Qty (${totalWoQty}) is less than Back Order Qty required (${boQty})`;
        } else {
          conflictStatus = 'COVERED';
          conflictDetails = `🟢 ${matchingWos.length} WO(s) scheduled covering ${totalWoQty} units`;
        }
      }
    }

    return {
      id: raw.id || `bo-${index}`,
      item: raw.item || 'UNKNOWN',
      backOrderQty: raw.backOrderQty || 0,
      supplyRequiredByDate: raw.supplyRequiredByDate || 'N/A',
      supplyRequiredDateParsed: reqDate,
      documentNumber: raw.documentNumber || '',
      status: raw.status || '',
      expectedShipDate: raw.expectedShipDate || '',
      estimateStockAvailableDate: raw.estimateStockAvailableDate || '',
      customerPo: raw.customerPo || '',
      dateCreated: raw.dateCreated || '',
      quantity: raw.quantity || 0,
      qtyShipped: raw.qtyShipped || 0,
      backOrderValueExGst: value,
      commit: raw.commit || '',
      location: raw.location || '',
      customerName: raw.customerName || 'Unknown Customer',
      classCategory: raw.classCategory || '',
      brand: raw.brand || 'Unbranded',
      typeCategory: raw.typeCategory || '',
      inventoryType: raw.inventoryType || '',
      urgency,
      urgencyReason,
      conflictStatus,
      conflictDetails,
      isShippingOrNonInventory: isNonInv
    };
  });
}

/**
 * Computes high-level metrics and aggregate breakdowns
 */
export function generateAnalysisSummary(items: BackOrderItem[]): ItemAnalysisSummary {
  const invItems = items.filter(i => !i.isShippingOrNonInventory);

  let totalBackorderQty = 0;
  let totalBackorderValue = 0;
  let criticalCount = 0;
  let highCount = 0;
  let noWorkOrderCount = 0;
  let scheduleConflictCount = 0;
  let qtyShortageCount = 0;
  let coveredCount = 0;

  const brandDist: Record<string, { count: number; value: number }> = {};
  const customerMap = new Map<string, { orderCount: number; totalValue: number; criticalCount: number }>();

  invItems.forEach(item => {
    totalBackorderQty += item.backOrderQty;
    totalBackorderValue += item.backOrderValueExGst;

    if (item.urgency === 'CRITICAL') criticalCount++;
    if (item.urgency === 'HIGH') highCount++;

    if (item.conflictStatus === 'NO_WORK_ORDER') noWorkOrderCount++;
    if (item.conflictStatus === 'SCHEDULE_CONFLICT') scheduleConflictCount++;
    if (item.conflictStatus === 'QUANTITY_SHORTAGE') qtyShortageCount++;
    if (item.conflictStatus === 'COVERED') coveredCount++;

    // Brand distribution
    const brand = item.brand.trim() || 'Other';
    if (!brandDist[brand]) {
      brandDist[brand] = { count: 0, value: 0 };
    }
    brandDist[brand].count++;
    brandDist[brand].value += item.backOrderValueExGst;

    // Customer map
    const cust = item.customerName.trim() || 'Unknown Customer';
    const existing = customerMap.get(cust) || { orderCount: 0, totalValue: 0, criticalCount: 0 };
    existing.orderCount++;
    existing.totalValue += item.backOrderValueExGst;
    if (item.urgency === 'CRITICAL') existing.criticalCount++;
    customerMap.set(cust, existing);
  });

  const customerImpact = Array.from(customerMap.entries())
    .map(([customerName, data]) => ({ customerName, ...data }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return {
    totalItems: invItems.length,
    totalBackorderQty,
    totalBackorderValue,
    criticalCount,
    highCount,
    noWorkOrderCount,
    scheduleConflictCount,
    qtyShortageCount,
    coveredCount,
    brandDistribution: brandDist,
    customerImpact
  };
}
