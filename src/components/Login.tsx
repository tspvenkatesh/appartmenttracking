import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Receipt, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#e0e7ff] via-[#fef2f2] to-[#f0fdf4]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-10 rounded-[3rem] shadow-2xl border-white/50 text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl ring-8 ring-white/20">
            <Receipt className="h-10 w-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">APTLY</h1>
          <p className="text-[10px] font-black text-indigo-600 tracking-[0.4em] uppercase">Management Environment</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-slate-500 font-bold text-sm">
            Please authenticate to access the building maintenance framework.
          </p>
          <Button 
            onClick={login}
            className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl transition-all group"
          >
            <LogIn className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            Authenticate with Google
          </Button>
        </div>

        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-4">
          Encrypted Access • Section 14 Regulatory Control
        </p>
      </motion.div>
    </div>
  );
};
