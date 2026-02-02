
import React from 'react';
import { CareerPath } from '../types';

interface CareerCardProps {
  career: CareerPath;
  onClick: () => void;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career, onClick }) => {
  const confidencePercent = Math.round(career.confidence * 100);
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer p-6 bg-white border border-gray-200 rounded-xl hover:border-[#0551BA] hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#0551BA]">
          {career.title}
        </h3>
        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-[#0551BA] rounded-full uppercase">
          {confidencePercent}% Fit
        </span>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
        {career.reason}
      </p>
      
      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Long-term Focus
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          {career.outlook.growth}% Growth
        </div>
      </div>
    </div>
  );
};
