import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Unit, Bill, Expense, MaintenanceConfig, BillCharges } from '../types';

export const MAINTENANCE_COLLECTION = 'units';
export const BILLS_COLLECTION = 'bills';
export const EXPENSES_COLLECTION = 'expenses';
export const CONFIGS_COLLECTION = 'configs';

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const q = query(collection(db, CONFIGS_COLLECTION), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return {
      defaultCharge: 1500,
      waterRatePerUnit: 15,
      totalUnits: 12
    };
  }
  return snapshot.docs[0].data() as MaintenanceConfig;
}

export async function calculateMonthlyCharges(month: number, year: number) {
  const config = await getMaintenanceConfig();
  
  // Get all expenses for this month
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  
  const snapshot = await getDocs(q);
  const expenses = snapshot.docs.map(doc => doc.data() as Expense);
  
  const totals = {
    security: 0,
    water_softener: 0,
    electricity: 0,
    misc: 0
  };
  
  expenses.forEach(exp => {
    if (exp.type === 'security') totals.security += exp.amount;
    else if (exp.type === 'water_softener') totals.water_softener += exp.amount;
    else if (exp.type === 'electricity') totals.electricity += exp.amount;
    else totals.misc += exp.amount;
  });
  
  return {
    defaultCharge: config.defaultCharge,
    securityShare: Math.round(totals.security / config.totalUnits),
    softenerShare: Math.round(totals.water_softener / config.totalUnits),
    electricityShare: Math.round(totals.electricity / config.totalUnits),
    miscCharge: Math.round(totals.misc / config.totalUnits),
    waterRate: config.waterRatePerUnit
  };
}
