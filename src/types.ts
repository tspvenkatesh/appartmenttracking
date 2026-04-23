export type ExpenseType = 'security' | 'water_softener' | 'elevator_amc' | 'electricity' | 'repair' | 'misc';
export type BillStatus = 'paid' | 'pending' | 'overdue';

export interface Unit {
  id: string;
  unitNumber: string;
  ownerName: string;
  tenantName: string;
  lastMeterReading: number;
  createdAt: string;
}

export interface BillCharges {
  defaultCharge: number;
  waterCharge: number;
  securityShare: number;
  softenerShare: number;
  electricityShare: number;
  miscCharge: number;
}

export interface Bill {
  id: string;
  unitId: string;
  unitNumber: string;
  month: number;
  year: number;
  charges: BillCharges;
  totalAmount: number;
  status: BillStatus;
  paidAt?: string;
  meterReadingStart: number;
  meterReadingEnd: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  type: ExpenseType;
  amount: number;
  date: string;
  isPeriodic: boolean;
  notes?: string;
}

export interface MaintenanceConfig {
  defaultCharge: number;
  waterRatePerUnit: number; // e.g. cost per liter/unit
  totalUnits: number;
}
