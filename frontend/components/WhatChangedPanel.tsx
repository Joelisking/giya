'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';

interface WhatChangedPanelProps {
  profile: UserProfile;
  onSubmit: (update: {
    type: 'setback' | 'opportunity' | 'values_shift' | 'life_event';
    description: string;
  }) => void;
  onClose: () => void;
  isProcessing: boolean;
}

const UPDATE_TYPES = [
  {
    id: 'setback',
    label: 'Setback or Challenge',
    description: 'Something did not go as planned',
    icon: '🛑',
    color: 'red',
  },
  {
    id: 'opportunity',
    label: 'New Opportunity',
    description: 'An exciting new door has opened',
    icon: '🚀',
    color: 'green',
  },
  {
    id: 'values_shift',
    label: 'Values Have Shifted',
    description: 'What matters to me has changed',
    icon: '💡',
    color: 'purple',
  },
  {
    id: 'life_event',
    label: 'Major Life Event',
    description: 'Something significant happened',
    icon: '🌟',
    color: 'blue',
  },
] as const;

export const WhatChangedPanel: React.FC<WhatChangedPanelProps> = ({
  profile: _profile,
  onSubmit,
  onClose,
  isProcessing,
}) => {
  const [selectedType, setSelectedType] = useState<
    'setback' | 'opportunity' | 'values_shift' | 'life_event' | null
  >(null);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!selectedType || !description.trim()) return;
    onSubmit({ type: selectedType, description: description.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif font-medium text-gray-900">
                What Changed?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Life happens. Let&apos;s reassess your path together.
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
        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              What kind of change?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {UPDATE_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? `border-${type.color}-400 bg-${type.color}-50`
                        : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {selectedType && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Tell me more
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  selectedType === 'setback'
                    ? 'What happened? How has it affected your plans?'
                    : selectedType === 'opportunity'
                      ? 'What opportunity has come up? How does it relate to your goals?'
                      : selectedType === 'values_shift'
                        ? 'What do you value differently now? What prompted this change?'
                        : 'What life event occurred? How might it affect your path?'
                }
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              <strong>Remember:</strong> Change is a natural part of
              growth. Giya will help you explore how this affects your
              journey and suggest adjusted paths.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isProcessing || !selectedType || !description.trim()
              }
              className="px-6 py-2.5 bg-[#0551BA] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reassessing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reassess My Path
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
