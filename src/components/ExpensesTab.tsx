import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, where, getDocs } from 'firebase/firestore';
import { Expense, ExpenseType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Receipt, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: 'security', label: 'Security Salary' },
  { value: 'water_softener', label: 'Water Softener Maint' },
  { value: 'elevator_amc', label: 'Elevator AMC' },
  { value: 'electricity', label: 'Common Electricity' },
  { value: 'repair', label: 'General Repair' },
  { value: 'misc', label: 'Miscellaneous' },
];

export const ExpensesTab = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExp, setNewExp] = useState({ title: '', amount: 0, type: 'misc' as ExpenseType, date: format(new Date(), 'yyyy-MM-dd'), notes: '' });

  useEffect(() => {
    const q = query(collection(db, 'expenses'));
    return onSnapshot(q, 
      (snapshot) => {
        setExpenses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense)).sort((a, b) => b.date.localeCompare(a.date)));
      },
      (err) => console.error('Expenses listener error:', err)
    );
  }, []);

  const handleAdd = async () => {
    if (!newExp.title || !newExp.amount) return;
    await addDoc(collection(db, 'expenses'), {
      ...newExp,
      createdAt: new Date().toISOString()
    });
    setNewExp({ title: '', amount: 0, type: 'misc' as ExpenseType, date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="glass !border-white/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-900/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Log Common Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Label</Label>
              <Input 
                placeholder="e.g. Security Salary" 
                value={newExp.title} 
                onChange={e => setNewExp({...newExp, title: e.target.value})}
                className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Amount (₹)</Label>
              <Input 
                type="number" 
                value={newExp.amount} 
                onChange={e => setNewExp({...newExp, amount: Number(e.target.value)})}
                className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cost Category</Label>
              <Select value={newExp.type} onValueChange={(v: ExpenseType) => setNewExp({...newExp, type: v})}>
                <SelectTrigger className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass !bg-white/80 border-white/50 rounded-xl">
                  {EXPENSE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="font-medium">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Billing Date</Label>
              <Input 
                type="date" 
                value={newExp.date} 
                onChange={e => setNewExp({...newExp, date: e.target.value})}
                className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-bold"
              />
            </div>
            <Button className="w-full h-11 bg-slate-800 text-white shadow-xl hover:bg-black transition-all rounded-xl font-black uppercase text-[10px] tracking-widest mt-2" onClick={handleAdd}>Record Entry</Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-6">
        <Card className="glass !border-white/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-white/20 border-b border-white/30">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex justify-between items-center">
              Shared Ledger
              <div className="glass px-4 py-1 rounded-full border-white text-xs font-black text-slate-800">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</div>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/5">
                <TableRow className="border-white/20 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Timeline</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Classification</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Description</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Sum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-white/10 hover:bg-white/30 transition-colors">
                    <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(exp.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="glass border-white text-slate-600 font-bold text-[9px] uppercase tracking-tighter px-2">
                        {exp.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-black text-slate-700">{exp.title}</TableCell>
                    <TableCell className="text-right font-black font-mono text-slate-800">₹{exp.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-bold italic">No records identified in ledger.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};
