'use client';

import React, { useState } from 'react';
import { CareerPath } from '@/types';

interface DecisionSandboxProps {
  careers: CareerPath[];
  onClose: () => void;
}

export const DecisionSandbox: React.FC<DecisionSandboxProps> = ({
  careers,
  onClose,
}) => {
  const [leftPath, setLeftPath] = useState<CareerPath | null>(
    careers[0] || null
  );
  const [rightPath, setRightPath] = useState<CareerPath | null>(
    careers[1] || null
  );

  const renderPathSelector = (
    selected: CareerPath | null,
    onSelect: (path: CareerPath) => void,
    otherSelected: CareerPath | null
  ) => (
    <select
      value={selected?.id || ''}
      onChange={(e) => {
        const path = careers.find((c) => c.id === e.target.value);
        if (path) onSelect(path);
      }}
      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
      <option value="">Select a path...</option>
      {careers
        .filter((c) => c.id !== otherSelected?.id)
        .map((career) => (
          <option key={career.id} value={career.id}>
            {career.title} ({career.confidence}% fit)
          </option>
        ))}
    </select>
  );

  const renderComparison = (
    path: CareerPath | null,
    color: string
  ) => {
    if (!path) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a path to compare
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div
          className={`p-4 bg-${color}-50 rounded-xl border border-${color}-200`}>
          <h3 className="text-lg font-bold text-gray-900">
            {path.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{path.reason}</p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-bold`}>
              {path.confidence}% Fit
            </span>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Lifestyle
          </h4>
          <p className="text-sm text-gray-700">{path.lifestyle}</p>
        </div>

        {/* Financial Outlook */}
        {path.outlook && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Financial Outlook
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Entry Salary</span>
                <span className="font-medium text-gray-900">
                  {path.outlook.entrySalary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mid-Career</span>
                <span className="font-medium text-gray-900">
                  {path.outlook.midSalary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Senior</span>
                <span className="font-medium text-gray-900">
                  {path.outlook.seniorSalary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demand</span>
                <span className="font-medium text-gray-900">
                  {path.outlook.demand}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Preview */}
        {path.timeline && path.timeline.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Timeline Preview
            </h4>
            <div className="space-y-2">
              {path.timeline.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 font-mono text-xs w-8">
                    {event.age}
                  </span>
                  <span className="text-gray-700">{event.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stability & Growth */}
        {path.outlook && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600">
                {path.outlook.stability}/10
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Stability
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">
                {path.outlook.growth}/10
              </div>
              <div className="text-xs text-gray-500 mt-1">Growth</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif font-medium text-gray-900">
                Decision Sandbox
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Compare paths side by side to see trade-offs clearly
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Path */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium text-gray-700">
                  Path A
                </span>
              </div>
              {renderPathSelector(leftPath, setLeftPath, rightPath)}
              {renderComparison(leftPath, 'purple')}
            </div>

            {/* Right Path */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  Path B
                </span>
              </div>
              {renderPathSelector(rightPath, setRightPath, leftPath)}
              {renderComparison(rightPath, 'blue')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 mx-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
          <p className="text-xs text-purple-700">
            <strong>Tip:</strong> Focus on what matters most to you —
            financial stability, growth potential, or lifestyle
            alignment. There&apos;s no wrong choice, only trade-offs.
          </p>
        </div>
      </div>
    </div>
  );
};
