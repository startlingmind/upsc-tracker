'use client';

import React, { useState, useEffect } from 'react';
import { geminiService } from '@/services/gemini';
import { Task } from '@/types';

interface AIExpertProps {
  day: number;
  tasks: Task[];
}

const AIExpert: React.FC<AIExpertProps> = ({ day, tasks }) => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    setError(false);
    try {
      const taskTitles = tasks.map(t => t.title);
      const text = await geminiService.getMotivationalQuote(day, taskTitles);
      setQuote(text || "Your future self is watching you today. Don't let them down.");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  return (
    <div className="bg-indigo-950 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group border border-indigo-800/50">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/20 backdrop-blur-sm">
            <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM13 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM16 16v-1a1 1 0 10-2 0v1a1 1 0 102 0z" />
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.234-2.32-.659-3.353-.423-1.034-1.03-1.93-1.785-2.623a1 1 0 00-1.428.1c-.244.275-.487.585-.717.915-.228.327-.442.677-.63 1.042-.23.447-.453.94-.64 1.458-.184.51-.345 1.033-.472 1.554a10.74 10.74 0 01-1.282-4.145c-.15-.97-.242-1.956-.328-2.888z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight tracking-wide">Daily Inspiration</h3>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>

        <div className="min-h-[80px]">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-2.5 bg-white/5 rounded w-full"></div>
              <div className="h-2.5 bg-white/5 rounded w-11/12"></div>
              <div className="h-2.5 bg-white/5 rounded w-4/5"></div>
            </div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-xs text-red-300">Sync with inspiration failed. Try again.</p>
            </div>
          ) : (
            <div className="relative">
              <svg className="absolute -top-2 -left-3 w-6 h-6 text-indigo-500/30 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V10C13.017 8.89543 13.9124 8 15.017 8H19.017C20.1216 8 21.017 8.89543 21.017 10V18C21.017 19.6569 19.6739 21 18.017 21H14.017ZM3.01705 21L3.01705 18C3.01705 16.8954 3.91248 16 5.01705 16H8.01705V14H4.01705C2.91248 14 2.01705 13.1046 2.01705 12V10C2.01705 8.89543 2.91248 8 4.01705 8H8.01705C9.12162 8 10.017 8.89543 10.017 10V18C10.017 19.6569 8.67391 21 7.01705 21H3.01705Z" /></svg>
              <p className="text-sm italic leading-relaxed text-indigo-100/90 pl-4 py-1">
                {quote}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={fetchQuote}
          disabled={loading}
          className="mt-6 w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-[0.98] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-indigo-400/10 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <svg className="animate-spin h-3 w-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : null}
          {loading ? 'Manifesting...' : 'New Inspiration'}
        </button>
      </div>
    </div>
  );
};

export default AIExpert;
