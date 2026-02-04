'use client';

import React, { useMemo } from 'react';
import { UserProgress } from '@/types';
import { UPSC_PLAN } from '@/constants';

interface StatsProps {
  progress: UserProgress;
  activeDay: number;
}

const Stats: React.FC<StatsProps> = ({ progress, activeDay }) => {
  const totalTasks = UPSC_PLAN.length;
  const completedCount = progress.completedTaskIds.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  
  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }, []);

  const finishDate = useMemo(() => {
    const d = new Date(progress.startDate);
    d.setDate(d.getDate() + 74); // 75th day
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [progress.startDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <StatCard 
        label="Overall Score" 
        value={`${progressPercent}%`} 
        subtext={`${completedCount}/${totalTasks} Units`}
        color="indigo"
      />
      <StatCard 
        label="Day" 
        value={activeDay.toString()} 
        subtext={todayDate}
        color="amber"
      />
      <StatCard 
        label="Streak" 
        value={progress.currentStreak.toString()} 
        subtext="Perfect Days"
        color="rose"
        icon={
          <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.234-2.32-.659-3.353-.423-1.034-1.03-1.93-1.785-2.623a1 1 0 00-1.428.1c-.244.275-.487.585-.717.915-.228.327-.442.677-.63 1.042-.23.447-.453.94-.64 1.458-.184.51-.345 1.033-.472 1.554a10.74 10.74 0 01-1.282-4.145c-.15-.97-.242-1.956-.328-2.888z" clipRule="evenodd" />
          </svg>
        }
      />
      <StatCard 
        label="Target End" 
        value={finishDate.split(' ').slice(0,2).join(' ')} 
        subtext={finishDate.split(' ').pop() || ''}
        color="emerald"
        isEnd
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; subtext: string; color: string; icon?: React.ReactNode; isEnd?: boolean }> = ({ label, value, subtext, color, icon, isEnd }) => {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm border border-slate-200 transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        {icon}
      </div>
      <div className="flex items-baseline gap-1.5 overflow-hidden">
        <span className={`text-base md:text-lg font-black text-slate-800 tracking-tight leading-none truncate ${isEnd ? 'text-xs md:text-sm' : ''}`}>
          {value}
        </span>
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-none truncate whitespace-nowrap">
          {subtext}
        </span>
      </div>
      <div className="mt-2 w-full bg-slate-50 h-1 rounded-full overflow-hidden border border-slate-100">
        <div 
          className={`h-full ${bgColors[color]} rounded-full transition-all duration-1000 shadow-sm`} 
          style={{ width: value.includes('%') ? value : (parseInt(value) > 75 ? '100%' : `${(parseInt(value)/75)*100}%`) }}
        ></div>
      </div>
    </div>
  );
};

export default Stats;
