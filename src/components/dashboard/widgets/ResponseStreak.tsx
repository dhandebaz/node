"use client";

import { motion } from "framer-motion";
import { Flame, Star, Trophy } from "lucide-react";

interface ResponseStreakProps {
  currentStreak: number;
  responseRate: number;
  className?: string;
}

export function ResponseStreak({ 
  currentStreak = 0, 
  responseRate = 0,
  className 
}: ResponseStreakProps) {
  return (
    <div className={className}>
      <div className="card-chunky overflow-hidden relative group">
        {/* Background Sparkle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 blur-[60px] rounded-full group-hover:bg-orange-500/10 transition-colors duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-[2rem] bg-orange-500 flex items-center justify-center border-b-4 border-orange-700 shadow-xl shadow-orange-200"
            >
              <Flame className="w-8 h-8 text-white fill-current" />
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{currentStreak}</p>
                <div className="px-2 py-0.5 bg-orange-100 rounded-lg">
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Day Streak</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perfect Response Speed</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <Star className="w-3 h-3 text-green-500 fill-current" />
               <span className="text-[10px] font-black text-green-700 uppercase tracking-tight">On Fire: {responseRate}% Rate</span>
            </div>
            {/* Simple progress bar */}
            <div className="w-full md:w-48 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${responseRate}%` }}
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="button-chunky w-full mt-6 gap-3">
          <Trophy className="w-4 h-4 text-orange-400" />
          View Milestones
        </button>
      </div>
    </div>
  );
}
