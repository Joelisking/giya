
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      <div className="relative mb-12">
        {/* Serene concentric ripples */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#0551BA]/10 rounded-full animate-ping duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#0551BA]/5 rounded-full animate-ping duration-[3000ms]" />
        
        <div className="w-20 h-20 bg-[#0551BA] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-sm">
        <h3 className="text-2xl font-serif text-gray-900 font-medium transition-all duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </h3>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em] animate-pulse">
          Consulting the Wisdom of Giya
        </p>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xs space-y-2">
        <div className="h-[2px] w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0551BA] animate-progress-indeterminate" />
        </div>
      </div>

      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 2s linear infinite;
        }
      `}</style>
    </div>
  );
};
