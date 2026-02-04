'use client';

import React, { useMemo } from 'react';
import { UPSC_PLAN, getPhaseForDay } from '@/constants';
import { UserProgress, Task } from '@/types';

interface DayTrackerProps {
  viewDay: number;
  activeDay: number;
  progress: UserProgress;
  onToggleTask: (taskId: string) => void;
}

const DayTracker: React.FC<DayTrackerProps> = ({ viewDay, activeDay, progress, onToggleTask }) => {
  // Enrichment: Map UPSC_PLAN tasks for today with the 'completed' flag
  const todayTasks = useMemo(() => {
    return UPSC_PLAN.filter(task => task.day === viewDay).map(task => ({
      ...task,
      completed: progress.completedTaskIds.includes(task.id)
    }));
  }, [viewDay, progress.completedTaskIds]);

  const isDayCompleted = useMemo(() => {
    return todayTasks.length > 0 && todayTasks.every(t => t.completed);
  }, [todayTasks]);

  // Next Item Logic: Only 1 item from viewDay + 1 if today is finished
  const nextTask = useMemo(() => {
    if (!isDayCompleted || viewDay >= 75) return null;
    const task = UPSC_PLAN.find(t => t.day === viewDay + 1);
    if (task) {
      return {
        ...task,
        completed: progress.completedTaskIds.includes(task.id)
      };
    }
    return null;
  }, [isDayCompleted, viewDay, progress.completedTaskIds]);

  const viewDate = useMemo(() => {
    const d = new Date(progress.startDate);
    d.setDate(d.getDate() + (viewDay - 1));
    return d.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, [viewDay, progress.startDate]);

  const spillover = useMemo(() => {
    if (viewDay < activeDay) return [];
    return UPSC_PLAN.filter(task => 
      task.day < viewDay && 
      !progress.completedTaskIds.includes(task.id)
    ).map(t => ({ ...t, completed: false }));
  }, [viewDay, activeDay, progress.completedTaskIds]);

  const phase = getPhaseForDay(viewDay);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
              {phase}
            </span>
            {viewDay === activeDay && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 animate-pulse">
                Today
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Day {viewDay}</h2>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {viewDate}
            </p>
          </div>
        </div>
        {isDayCompleted && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm self-start md:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Daily Goal Achieved
          </div>
        )}
      </div>

      {spillover.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-amber-100/50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-bold text-amber-800 text-[10px] uppercase tracking-widest">Pending from Previous Days</span>
            </div>
            <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-bold">{spillover.length} Tasks</span>
          </div>
          <div className="divide-y divide-amber-100">
            {spillover.map(task => (
              <TaskItem key={task.id} task={task} onToggle={() => onToggleTask(task.id)} isSpillover />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Syllabus Checklist</h3>
          <span className="text-[9px] font-medium text-slate-400">Target: All topics</span>
        </div>
        <div className="divide-y divide-slate-100">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={() => onToggleTask(task.id)} 
              />
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400">No specific tasks scheduled for this day yet.</p>
            </div>
          )}
          
          {/* Next Task Preview Section */}
          {nextTask && (
            <div className="bg-indigo-50/30 border-t border-dashed border-indigo-200 animate-slide-up">
              <div className="px-4 py-1.5 bg-indigo-50/50 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Extra Mile: Up Next (Day {viewDay + 1})</span>
              </div>
              <TaskItem 
                task={nextTask} 
                onToggle={() => onToggleTask(nextTask.id)} 
                isNextDayPreview
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; onToggle: () => void; isSpillover?: boolean; isNextDayPreview?: boolean }> = ({ task, onToggle, isSpillover, isNextDayPreview }) => {
  const isCompleted = task.completed;
  
  return (
    <div 
      onClick={onToggle}
      className={`group flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-all hover:bg-slate-50 ${isCompleted ? 'bg-slate-50/30' : ''} ${isNextDayPreview ? 'opacity-80' : ''}`}
    >
      <div className={`
        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
        ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-slate-200 bg-white group-hover:border-indigo-400 group-hover:shadow-md'}
        ${isNextDayPreview && !isCompleted ? 'border-dashed border-indigo-300' : ''}
      `}>
        {isCompleted && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        {isNextDayPreview && !isCompleted && <svg className="w-2.5 h-2.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
          <span className={`text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded shadow-sm ${isSpillover ? 'bg-amber-100 text-amber-700' : isNextDayPreview ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            {task.category}
          </span>
          {isSpillover && (
            <span className="text-[8px] font-bold text-amber-600 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
              Original: Day {task.day}
            </span>
          )}
          {isNextDayPreview && !isCompleted && (
             <span className="text-[8px] font-bold text-indigo-500 animate-pulse">Preview</span>
          )}
        </div>
        <h3 className={`text-sm font-semibold transition-all ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
          {task.title}
        </h3>
      </div>
    </div>
  );
};

export default DayTracker;
