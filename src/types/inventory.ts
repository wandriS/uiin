export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'DEPLETED' | 'DRAFT';

export type MovementType = 
  | 'RECEIPT' 
  | 'PICK_PACK' 
  | 'TRANSFER' 
  | 'CYCLE_ADJUST' 
  | 'QUARANTINE_WRITE_OFF';

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number;
  phone: string;
}

export interface SKUItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  binLocation: string;
  zone: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
  minThreshold: number;
  maxCapacity: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  status: StockStatus;
  barcode: string;
  lastAudited: string;
  lastRestocked: string;
  supplier: Supplier;
  weightKg: number;
  dimensions: string;
  notes?: string;
  quarantinedCount?: number;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  sku: string;
  skuName: string;
  type: MovementType;
  operatorName: string;
  deltaQuantity: number;
  priorQuantity: number;
  newQuantity: number;
  referenceDoc: string;
  reason: string;
  sourceBin?: string;
  targetBin?: string;
}

export interface InboundItem {
  sku: string;
  name: string;
  expectedQty: number;
  receivedQty: number;
  targetBin: string;
  inspected: boolean;
}

export interface InboundShipment {
  id: string;
  poNumber: string;
  supplierName: string;
  eta: string;
  arrivalDate?: string;
  status: 'SCHEDULED' | 'AT_DOCK' | 'RECEIVING' | 'INSPECTED' | 'STORED';
  dockBay: string;
  palletsCount: number;
  carrier: string;
  items: InboundItem[];
}

export interface BinSlot {
  id: string;
  code: string;
  zone: string;
  aisle: string;
  level: number;
  maxCapacityUnits: number;
  currentUnits: number;
  assignedSKUs: string[];
  temperatureType: 'AMBIENT' | 'COLD' | 'HAZARDOUS' | 'HIGH_SECURITY';
}
