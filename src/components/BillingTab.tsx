import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, where, getDocs, limit } from 'firebase/firestore';
import { Unit, Bill, BillStatus } from '../types';
import { calculateMonthlyCharges } from '../lib/maintenance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, FileText, CheckCircle, Clock, Droplets } from 'lucide-react';
import { format } from 'date-fns';

export const BillingTab = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubUnits = onSnapshot(collection(db, 'units'), 
      (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))),
      (err) => console.error('Billing Units listener error:', err)
    );
    const unsubBills = onSnapshot(collection(db, 'bills'), 
      (s) => setBills(s.docs.map(d => ({ id: d.id, ...d.data() } as Bill))),
      (err) => console.error('Billing Bills listener error:', err)
    );
    return () => {
      unsubUnits();
      unsubBills();
    };
  }, []);

  const generateBills = async () => {
    setIsGenerating(true);
    try {
      const charges = await calculateMonthlyCharges(selectedMonth, selectedYear);
      
      for (const unit of units) {
        // Check if bill already exists
        const exists = bills.find(b => b.unitId === unit.id && b.month === selectedMonth && b.year === selectedYear);
        if (exists) continue;

        const waterConsumption = 0; // Default if no reading
        const waterCharge = waterConsumption * charges.waterRate;
        const total = charges.defaultCharge + charges.securityShare + charges.softenerShare + charges.electricityShare + charges.miscCharge + waterCharge;

        await addDoc(collection(db, 'bills'), {
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          month: selectedMonth,
          year: selectedYear,
          charges: {
            defaultCharge: charges.defaultCharge,
            waterCharge,
            securityShare: charges.securityShare,
            softenerShare: charges.softenerShare,
            electricityShare: charges.electricityShare,
            miscCharge: charges.miscCharge
          },
          totalAmount: total,
          status: 'pending',
          meterReadingStart: unit.lastMeterReading,
          meterReadingEnd: unit.lastMeterReading, // Admin updates this later
          createdAt: new Date().toISOString()
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsPaid = async (billId: string) => {
    await updateDoc(doc(db, 'bills', billId), {
      status: 'paid',
      paidAt: new Date().toISOString()
    });
  };

  const filteredBills = bills.filter(b => b.month === selectedMonth && b.year === selectedYear);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 p-6 glass border-white/50 rounded-3xl">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Billing Cycle</Label>
          <div className="flex gap-2">
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[160px] glass !bg-white/40 border-white/50 rounded-xl h-11 font-bold">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="glass !bg-white/80 border-white/50 rounded-xl">
                {Array.from({length: 12}).map((_, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()} className="font-medium">{format(new Date(2024, i, 1), 'MMMM')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[110px] glass !bg-white/40 border-white/50 rounded-xl h-11 font-bold">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="glass !bg-white/80 border-white/50 rounded-xl">
                {[2024, 2025, 2026].map(y => (
                  <SelectItem key={y} value={y.toString()} className="font-medium">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button disabled={isGenerating} onClick={generateBills} className="bg-slate-800 text-white shadow-xl hover:bg-black transition-all h-11 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">
          {isGenerating ? 'Computing...' : `Process ${format(new Date(2024, selectedMonth-1, 1), 'MMM')} Cycle`}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass !border-white/50 rounded-3xl bg-white/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-black text-slate-800">₹{filteredBills.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Total Billable</p>
          </CardContent>
        </Card>
        <Card className="glass !bg-emerald-500/5 !border-emerald-200/50 rounded-3xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-black text-emerald-600">₹{filteredBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}</div>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black mt-1">Collected</p>
          </CardContent>
        </Card>
        <Card className="glass !bg-amber-500/5 !border-amber-200/50 rounded-3xl">
          <CardContent className="pt-6">
             <div className="text-2xl font-black text-amber-600">₹{filteredBills.filter(b => b.status === 'pending').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}</div>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass !border-white/50 rounded-3xl">
          <CardContent className="pt-6">
             <div className="text-2xl font-black text-slate-800">{filteredBills.filter(b => b.status === 'paid').length} / {filteredBills.length}</div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Invoices Settled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass !border-white/50 rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/5">
            <TableRow className="border-white/50 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Unit</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Water Usage</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Details</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Statement</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Status</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id} className="border-white/20 hover:bg-white/30 transition-colors">
                <TableCell className="font-black text-slate-700 text-lg">{bill.unitNumber}</TableCell>
                <TableCell className="text-xs font-bold text-slate-500">
                   <div className="flex items-center">
                     <Droplets className="w-3 h-3 mr-1 text-blue-400" />
                     {bill.meterReadingEnd - bill.meterReadingStart} Units
                   </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 px-4 text-[9px] uppercase font-black tracking-widest glass border-white/20 hover:bg-white/50" />}>
                      Breakdown
                    </DialogTrigger>
                    <DialogContent className="glass !bg-white/90 border-white/50 rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800">Bill Breakdown — Unit {bill.unitNumber}</DialogTitle>
                        <DialogDescription className="font-bold text-indigo-600">{format(new Date(bill.year, bill.month-1), 'MMMM yyyy')}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        {[
                          { label: 'Basic Maintenance', value: bill.charges.defaultCharge },
                          { label: 'Security Service', value: bill.charges.securityShare },
                          { label: 'Water Softener', value: bill.charges.softenerShare },
                          { label: 'Common Electricity', value: bill.charges.electricityShare },
                          { label: 'Water Usage Charge', value: bill.charges.waterCharge },
                          { label: 'Sundry Expenses', value: bill.charges.miscCharge }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-bold">{item.label}</span>
                            <span className="font-black text-slate-700 font-mono">₹{item.value}</span>
                          </div>
                        ))}
                        <Separator className="bg-slate-200" />
                        <div className="flex justify-between font-black text-2xl items-center pt-2">
                          <span className="text-slate-800">Payable</span>
                          <span className="text-indigo-600">₹{bill.totalAmount}</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="font-mono font-black text-slate-700">₹{bill.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={bill.status === 'paid' ? 'default' : 'outline'} className={bill.status === 'paid' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-black text-[9px]' : 'bg-amber-50 text-amber-600 border-amber-200 font-black text-[9px]'}>
                    {bill.status === 'paid' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                    {bill.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {bill.status !== 'paid' && (
                    <Button size="sm" className="h-8 glass bg-slate-800 text-white border-none hover:bg-black rounded-lg font-bold text-[10px] px-4" onClick={() => markAsPaid(bill.id)}>Settle</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredBills.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-bold italic">
                  No records identified for this billing period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// End of file
