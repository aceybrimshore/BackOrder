export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ConflictStatus = 
  | 'NO_WORK_ORDER'
  | 'SCHEDULE_CONFLICT'
  | 'QUANTITY_SHORTAGE'
  | 'COVERED'
  | 'EXEMPT';

export interface BackOrderItem {
  id: string;
  item: string; // SKU
  backOrderQty: number;
  supplyRequiredByDate: string; // Raw format (DD/MM/YYYY)
  supplyRequiredDateParsed: Date | null;
  documentNumber: string; // SO number
  status: string; // Pending Fulfillment, Partially Fulfilled
  expectedShipDate: string;
  estimateStockAvailableDate: string;
  customerPo: string;
  dateCreated: string;
  quantity: number;
  qtyShipped: number;
  backOrderValueExGst: number;
  commit: string;
  location: string;
  customerName: string;
  classCategory: string;
  brand: string;
  typeCategory: string;
  inventoryType: string;
  
  // Computed fields
  urgency: UrgencyLevel;
  urgencyReason: string;
  conflictStatus: ConflictStatus;
  conflictDetails: string;
  isShippingOrNonInventory: boolean;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  item: string; // SKU matching BackOrderItem.item
  description?: string;
  scheduledQty: number;
  scheduledDate: string; // YYYY-MM-DD or DD/MM/YYYY
  scheduledDateParsed: Date | null;
  status: 'Planned' | 'Released' | 'In Progress' | 'Completed' | 'Delayed';
  workCenter?: string;
  notes?: string;
}

export interface ItemAnalysisSummary {
  totalItems: number;
  totalBackorderQty: number;
  totalBackorderValue: number;
  criticalCount: number;
  highCount: number;
  noWorkOrderCount: number;
  scheduleConflictCount: number;
  qtyShortageCount: number;
  coveredCount: number;
  brandDistribution: Record<string, { count: number; value: number }>;
  customerImpact: Array<{ customerName: string; orderCount: number; totalValue: number; criticalCount: number }>;
}

export interface FilterState {
  search: string;
  urgency: string; // 'ALL' | UrgencyLevel
  conflictStatus: string; // 'ALL' | ConflictStatus
  brand: string; // 'ALL' | brand name
  location: string; // 'ALL' | location name
  itemType: string; // 'ALL' | item type category name
  cutoffDate: string | null; // YYYY-MM-DD or null
  excludeShippingNonInventory: boolean;
  sortBy: 'urgency' | 'requiredDate' | 'value' | 'qty' | 'item';
  sortOrder: 'asc' | 'desc';
}

export interface GlobalFilterState {
  location: string;
  brand: string;
  itemType: string;
  cutoffDate: string | null; // Cutoff date in YYYY-MM-DD format
}
