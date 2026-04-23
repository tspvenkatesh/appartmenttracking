import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Unit } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Home, Droplets } from 'lucide-react';

export const UnitsTab = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ unitNumber: '', ownerName: '', tenantName: '', lastMeterReading: 0 });

  useEffect(() => {
    const q = query(collection(db, 'units'));
    return onSnapshot(q, 
      (snapshot) => setUnits(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Unit))),
      (err) => console.error('Units listener error:', err)
    );
  }, []);

  const handleAdd = async () => {
    if (!newUnit.unitNumber) return;
    await addDoc(collection(db, 'units'), {
      ...newUnit,
      createdAt: new Date().toISOString()
    });
    setIsAddOpen(false);
    setNewUnit({ unitNumber: '', ownerName: '', tenantName: '', lastMeterReading: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      await deleteDoc(doc(db, 'units', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Occupancy Directory</h2>
          <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-widest">Real-time Apartment Mapping</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-slate-800 text-white shadow-xl hover:bg-black transition-all rounded-xl font-black uppercase text-[10px] tracking-widest h-11 px-8" />}>
            <Plus className="mr-2 h-4 w-4" /> Provision Unit
          </DialogTrigger>
          <DialogContent className="glass !bg-white/90 border-white/50 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-800">New Apartment Entry</DialogTitle>
              <DialogDescription className="font-bold text-indigo-600">Register a new physical unit in the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 border-y border-white/20 my-4">
              <div className="space-y-2">
                <Label htmlFor="unitNumber" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Flat Identifier</Label>
                <Input id="unitNumber" placeholder="e.g. 101-B" className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-black" value={newUnit.unitNumber} onChange={e => setNewUnit({...newUnit, unitNumber: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Principal Owner</Label>
                  <Input id="owner" placeholder="Full Name" className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-bold" value={newUnit.ownerName} onChange={e => setNewUnit({...newUnit, ownerName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Occupant</Label>
                  <Input id="tenant" placeholder="Optional" className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-bold" value={newUnit.tenantName} onChange={e => setNewUnit({...newUnit, tenantName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meter" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Meter Reading (Liters)</Label>
                <Input id="meter" type="number" className="glass !bg-white/40 border-white/50 h-11 rounded-xl font-mono font-black" value={newUnit.lastMeterReading} onChange={e => setNewUnit({...newUnit, lastMeterReading: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-black transition-all rounded-xl h-11 font-black uppercase text-[10px] tracking-widest text-white shadow-lg">Commit Registry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass !border-white/50 rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/5">
            <TableRow className="border-white/50 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Unit #</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Owner</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Tenant</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Consump. ID</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 py-6">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id} className="border-white/10 hover:bg-white/30 transition-colors">
                <TableCell className="font-black text-slate-800 text-lg flex items-center h-full pt-6">
                   <div className="w-8 h-8 glass rounded-lg flex items-center justify-center mr-3 border-white/40">
                      <Home className="h-4 w-4 text-indigo-400" />
                   </div>
                   {unit.unitNumber}
                </TableCell>
                <TableCell className="font-bold text-slate-600">{unit.ownerName}</TableCell>
                <TableCell>
                   {unit.tenantName ? (
                     <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold hover:bg-blue-50 uppercase text-[9px]">{unit.tenantName}</Badge>
                   ) : (
                     <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold uppercase text-[9px] italic">Vacant</Badge>
                   )}
                </TableCell>
                <TableCell className="font-mono font-black text-slate-500">
                   <div className="flex items-center">
                     <Droplets className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
                     {unit.lastMeterReading.toLocaleString()} L
                   </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 rounded-full transition-all" onClick={() => handleDelete(unit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold italic">No units identified in registry.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
