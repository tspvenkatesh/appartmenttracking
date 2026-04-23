import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Expense, Bill, Unit } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, Users, Home, TrendingUp, AlertCircle, Droplets, CheckCircle, Receipt } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const DashboardTab = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const unsubBills = onSnapshot(collection(db, 'bills'), (s) => setBills(s.docs.map(d => ({ id: d.id, ...d.data() } as Bill))), (err) => console.error('Dashboard Bills listener error:', err));
    const unsubExps = onSnapshot(collection(db, 'expenses'), (s) => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() } as Expense))), (err) => console.error('Dashboard Expenses listener error:', err));
    const unsubUnits = onSnapshot(collection(db, 'units'), (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (err) => console.error('Dashboard Units listener error:', err));
    
    return () => {
      unsubBills();
      unsubExps();
      unsubUnits();
    };
  }, []);

  const currentMonthBills = bills.filter(b => b.month === new Date().getMonth() + 1 && b.year === new Date().getFullYear());
  const pendingCollection = currentMonthBills.filter(b => b.status === 'pending').reduce((s, b) => s + b.totalAmount, 0);
  const totalCollected = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Chart Data: Last 6 months collection vs expenses
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const monthlyBills = bills.filter(b => b.month === m && b.year === y && b.status === 'paid');
    const monthlyExps = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() + 1 === m && ed.getFullYear() === y;
    });
    
    return {
      name: format(d, 'MMM'),
      collected: monthlyBills.reduce((s, b) => s + b.totalAmount, 0),
      spent: monthlyExps.reduce((s, e) => s + e.amount, 0)
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass relative overflow-hidden group !border-white/50 rounded-3xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><IndianRupee className="w-16 h-16" /></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">Total Balance</CardDescription>
            <CardTitle className="text-3xl font-black text-slate-800">₹{(totalCollected - totalExpenses).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-full inline-flex items-center font-bold">
               <TrendingUp className="w-3 h-3 mr-1" /> ACTIVE SAVINGS
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass !bg-amber-500/5 !border-amber-200/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-[0.15em] text-amber-600">Pending Dues</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-800">₹{pendingCollection.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-[10px] text-amber-600 bg-white/40 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center font-bold">
                <AlertCircle className="w-3 h-3 mr-1" /> UNCOLLECTED
             </div>
          </CardContent>
        </Card>

        <Card className="glass !border-white/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">Occupancy</CardDescription>
            <CardTitle className="text-3xl font-black text-slate-800">{units.length}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-[10px] text-slate-500 bg-white/40 border border-white px-2 py-0.5 rounded-full inline-flex items-center font-bold uppercase tracking-tighter">
                <Users className="w-3 h-3 mr-1" /> Units Tracked
             </div>
          </CardContent>
        </Card>

        <Card className="glass !bg-indigo-600 border-none rounded-3xl shadow-indigo-200 shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-[0.15em] text-white/60">Water Efficiency</CardDescription>
            <CardTitle className="text-3xl font-black text-white">HIGH</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-[10px] text-white/90 border border-white/30 px-2 py-0.5 rounded-full inline-flex items-center font-bold uppercase tracking-tighter">
                <Droplets className="w-3 h-3 mr-1" /> Optimized
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass !border-white/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Financial Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.2)' }}
                  contentStyle={{ borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}
                />
                <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={24} name="Income" />
                <Bar dataKey="spent" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass !border-white/50 rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Maintenance Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 transition-all hover:bg-white/60">
               <div className="flex items-center text-amber-800 font-bold text-sm mb-1">
                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl mr-3 shadow-sm">🧂</div>
                 <div>
                   <span className="block leading-none">Salt Refill</span>
                   <span className="text-[10px] text-amber-600 bg-amber-50 px-2 rounded-md font-bold inline-block mt-1 uppercase">QUARTERLY</span>
                 </div>
               </div>
               <p className="text-xs text-slate-500 mt-2 pl-1">Softener replenishment due in <span className="font-bold text-slate-800">12 days</span>.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 transition-all hover:bg-white/60">
               <div className="flex items-center text-slate-800 font-bold text-sm mb-1">
                 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl mr-3 shadow-sm">🛗</div>
                 <div>
                    <span className="block leading-none">Elevator AMC</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 rounded-md font-bold inline-block mt-1 uppercase">YEARLY</span>
                 </div>
               </div>
               <p className="text-xs text-slate-500 mt-2 pl-1">Contract renewal on <span className="font-bold text-slate-800">Dec 12</span>.</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 transition-all hover:bg-white/60">
               <div className="flex items-center text-emerald-800 font-bold text-sm mb-1">
                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl mr-3 shadow-sm">🛡️</div>
                 <div>
                    <span className="block leading-none">Staff Salaries</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 rounded-md font-bold inline-block mt-1 uppercase">MONTHLY</span>
                 </div>
               </div>
               <p className="text-xs text-slate-500 mt-2 pl-1">All security guard payments <span className="font-bold text-emerald-600 italic">Clear</span>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
