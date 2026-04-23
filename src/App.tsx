/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Receipt, Settings as SettingsIcon, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from './components/DashboardTab';
import { UnitsTab } from './components/UnitsTab';
import { BillingTab } from './components/BillingTab';
import { ExpensesTab } from './components/ExpensesTab';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import { LogOut } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function App() {
  const [activeTab, setActiveTab ] = useState('dashboard');
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-[#fef2f2] to-[#f0fdf4]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-indigo-600 p-4 rounded-2xl shadow-xl"
        >
          <Receipt className="h-10 w-10 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full glass rounded-3xl flex flex-col overflow-hidden shadow-2xl flex-1">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full glass border-b !bg-white/20 backdrop-blur-md">
          <div className="container mx-auto flex h-20 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg ring-4 ring-white/30">
                 <Receipt className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-800 leading-none">APTLY</span>
                <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] mt-1">MAINT PRO</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative glass border-none hover:bg-white/40">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user.displayName || 'Security Admin'}</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">{user.email === 'tsp.venkatesh@gmail.com' ? 'System Administrator' : 'Tenant Access'}</p>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
                ) : (
                  <div className="h-10 w-10 rounded-full glass border-2 border-white flex items-center justify-center font-bold text-slate-600 shadow-sm">
                    {user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={logout} className="glass border-none hover:bg-red-50 hover:text-red-600 ml-1">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero / Tabs Header */}
        <div className="glass-dark px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Maintenance Oversight</h1>
              <p className="text-xs font-medium text-slate-500 tracking-wide">October 2023 • Billing Cycle Open</p>
           </div>
           <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest glass border-white/50 text-slate-700 hover:bg-white/40">
                 Export Report
              </Button>
              <Button size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest bg-slate-800 hover:bg-black text-white rounded-xl shadow-lg">
                 New Update
              </Button>
           </div>
        </div>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center sm:justify-start">
              <TabsList className="glass p-1 h-14 !bg-slate-900/5 border-white/20 rounded-2xl">
                <TabsTrigger value="dashboard" className="data-[state=active]:glass data-[state=active]:!bg-white data-[state=active]:text-indigo-700 rounded-xl px-8 h-full transition-all">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:glass data-[state=active]:!bg-white data-[state=active]:text-indigo-700 rounded-xl px-8 h-full transition-all">
                  <CreditCard className="mr-2 h-4 w-4" /> Billing
                </TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:glass data-[state=active]:!bg-white data-[state=active]:text-indigo-700 rounded-xl px-8 h-full transition-all">
                  <Receipt className="mr-2 h-4 w-4" /> Expenses
                </TabsTrigger>
                <TabsTrigger value="units" className="data-[state=active]:glass data-[state=active]:!bg-white data-[state=active]:text-indigo-700 rounded-xl px-8 h-full transition-all">
                  <Users className="mr-2 h-4 w-4" /> Units
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:glass data-[state=active]:!bg-white data-[state=active]:text-indigo-700 rounded-xl px-8 h-full transition-all">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Configuration
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="dashboard" className="m-0 outline-none">
                  <DashboardTab />
                </TabsContent>
                <TabsContent value="billing" className="m-0 outline-none">
                  <BillingTab />
                </TabsContent>
                <TabsContent value="expenses" className="m-0 outline-none">
                  <ExpensesTab />
                </TabsContent>
                <TabsContent value="units" className="m-0 outline-none">
                  <UnitsTab />
                </TabsContent>
                <TabsContent value="settings" className="m-0 outline-none">
                  <Card className="max-w-xl mx-auto glass rounded-3xl !border-white/50">
                     <CardHeader>
                        <CardTitle className="text-slate-800">System Configuration</CardTitle>
                        <CardDescription>Adjust base parameters for maintenance calculation.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Default Maintenance (₹)</Label>
                           <Input type="number" defaultValue={1500} className="glass !bg-white/40 border-white/50 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Water Rate (Per Unit)</Label>
                           <Input type="number" defaultValue={15} className="glass !bg-white/40 border-white/50 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Apartments Count</Label>
                           <Input type="number" defaultValue={12} className="glass !bg-white/40 border-white/50 rounded-xl" />
                        </div>
                        <Separator className="bg-slate-200/50" />
                        <div className="pt-2 space-y-4">
                           <h3 className="font-bold text-sm text-slate-700">Maintenance Schedules</h3>
                           <div className="flex items-center justify-between p-4 rounded-2xl glass border-white/50">
                              <span className="text-xs font-semibold text-slate-600">Salt Bag Refill Cycle</span>
                              <Badge variant="outline" className="glass border-indigo-200 text-indigo-700 font-bold">3 Months</Badge>
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-2xl glass border-white/50">
                              <span className="text-xs font-semibold text-slate-600">Elevator AMC Cycle</span>
                              <Badge variant="outline" className="glass border-blue-200 text-blue-700 font-bold">Yearly</Badge>
                           </div>
                        </div>
                        <Button 
                           onClick={async () => {
                             if (!confirm('Import March 2026 Data? This will overwrite existing records for this period.')) return;
                             const { db } = await import('./lib/firebase');
                             const { collection, addDoc, getDocs, query, where, writeBatch } = await import('firebase/firestore');
                             
                             const unitsData = ['001','002','003','101','102','103','201','202','203','301','302','303','401','402','403'];
                             const unitMap: Record<string, string> = {};
                             
                             for (const unitNo of unitsData) {
                               const q = query(collection(db, 'units'), where('unitNumber', '==', unitNo));
                               const snap = await getDocs(q);
                               if (snap.empty) {
                                 const docRef = await addDoc(collection(db, 'units'), { 
                                   unitNumber: unitNo, 
                                   ownerName: `Owner ${unitNo}`, 
                                   tenantName: '', 
                                   lastMeterReading: 0, 
                                   createdAt: new Date().toISOString() 
                                 });
                                 unitMap[unitNo] = docRef.id;
                               } else {
                                 unitMap[unitNo] = snap.docs[0].id;
                               }
                             }

                             await addDoc(collection(db, 'expenses'), { title: 'Security Salary', type: 'security', amount: 11000, date: '2026-03-31', createdAt: new Date().toISOString() });
                             await addDoc(collection(db, 'expenses'), { title: 'Water Tanker (19 loads)', type: 'misc', amount: 19200, date: '2026-03-31', createdAt: new Date().toISOString() });
                             await addDoc(collection(db, 'expenses'), { title: 'Bescom Electricity', type: 'electricity', amount: 4514, date: '2026-03-31', createdAt: new Date().toISOString() });
                             await addDoc(collection(db, 'expenses'), { title: 'Water Softener Maint', type: 'water_softener', amount: 1500, date: '2026-03-31', createdAt: new Date().toISOString() });
                             await addDoc(collection(db, 'expenses'), { title: 'Salt Bags purchase', type: 'water_softener', amount: 2850, date: '2026-03-31', createdAt: new Date().toISOString() });

                             const bills = [
                               { unit: '001', amount: 3800, paid: true, start: 16816, end: 18419 },
                               { unit: '002', amount: 3050, paid: true, start: 12827, end: 13795 },
                               { unit: '003', amount: 5700, paid: true, start: 33060, end: 36251 },
                               { unit: '101', amount: 2900, paid: true, start: 13134, end: 13988 },
                               { unit: '102', amount: 3250, paid: true, start: 15593, end: 16727 },
                               { unit: '103', amount: 3750, paid: false, start: 23774, end: 25329 },
                               { unit: '201', amount: 2550, paid: false, start: 6306, end: 6866 },
                               { unit: '202', amount: 3550, paid: false, start: 22259, end: 23658 },
                               { unit: '203', amount: 1900, paid: false, start: 19749, end: 19757 },
                               { unit: '301', amount: 3650, paid: true, start: 13667, end: 15150 },
                               { unit: '302', amount: 3250, paid: false, start: 14311, end: 15433 },
                               { unit: '303', amount: 3350, paid: true, start: 14922, end: 16125 },
                               { unit: '401', amount: 3200, paid: true, start: 15765, end: 16854 },
                               { unit: '402', amount: 1950, paid: false, start: 8860, end: 8914 },
                               { unit: '403', amount: 2950, paid: false, start: 27950, end: 28857 },
                             ];

                             for (const b of bills) {
                               await addDoc(collection(db, 'bills'), {
                                 unitId: unitMap[b.unit],
                                 unitNumber: b.unit,
                                 month: 3,
                                 year: 2026,
                                 charges: {
                                   defaultCharge: 1800,
                                   securityShare: 733,
                                   softenerShare: 290,
                                   electricityShare: 301,
                                   waterCharge: Math.round((b.end - b.start) * 0.12),
                                   miscCharge: 1280,
                                 },
                                 totalAmount: b.amount,
                                 status: b.paid ? 'paid' : 'pending',
                                 paidAt: b.paid ? new Date().toISOString() : null,
                                 meterReadingStart: b.start,
                                 meterReadingEnd: b.end,
                                 createdAt: new Date().toISOString()
                               });
                             }
                             alert('Ingestion Complete for Mar 2026!');
                           }}
                           className="w-full h-12 text-xs font-bold uppercase tracking-widest glass border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-4"
                        >
                           Import Ledger: Mar 2026
                        </Button>
                        <Button className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-slate-800 hover:bg-black text-white rounded-xl mt-2">Save Configuration</Button>
                     </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>

        <footer className="py-6 glass-dark border-t border-white/10 mt-auto">
           <div className="container mx-auto px-6 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Aptly Admin Framework &copy; 2026 • Encrypted Management Environment
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
}

