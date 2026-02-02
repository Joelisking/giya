'use client';

import React, { useState } from 'react';
import { ONBOARDING_QUESTIONS } from '@/constants';

interface CareerInterestsPanelProps {
  interests: string;
  impactGoals: string;
  onSave: (updates: {
    interests: string;
    impactGoals: string;
  }) => void;
  onClose: () => void;
  isSaving: boolean;
}

const INTERESTS_OPTIONS =
  ONBOARDING_QUESTIONS.find((q) => q.key === 'interests')?.options ||
  [];
const IMPACT_OPTIONS =
  ONBOARDING_QUESTIONS.find((q) => q.key === 'impactGoals')
    ?.options || [];

export const CareerInterestsPanel: React.FC<
  CareerInterestsPanelProps
> = ({ interests, impactGoals, onSave, onClose, isSaving }) => {
  // Parse comma-separated values into arrays
  const parseValues = (str: string) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const [selectedInterests, setSelectedInterests] = useState<
    string[]
  >(parseValues(interests));
  const [selectedImpact, setSelectedImpact] = useState<string[]>(
    parseValues(impactGoals)
  );

  const toggleInterest = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const toggleImpact = (value: string) => {
    setSelectedImpact((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSave = () => {
    onSave({
      interests: selectedInterests.join(', '),
      impactGoals: selectedImpact.join(', '),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-medium text-gray-900">
              Career Interests
            </h2>
            <p className="text-sm text-gray-500">
              What excites you and drives your ambitions?
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

        <div className="space-y-6">
          {/* Interests Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              What excites you most?
            </h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((opt) => {
                const isSelected = selectedInterests.includes(
                  opt.value
                );
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleInterest(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Impact Goals Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              What impact do you want to have?
            </h3>
            <div className="flex flex-wrap gap-2">
              {IMPACT_OPTIONS.map((opt) => {
                const isSelected = selectedImpact.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleImpact(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-xs text-purple-700">
            Changing your interests will influence your career path
            recommendations.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0551BA] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
