'use client';

import React, { useState } from 'react';
import { ONBOARDING_QUESTIONS } from '@/constants';

interface SkillInventoryPanelProps {
  strengths: string;
  workStyle: string;
  onSave: (updates: { strengths: string; workStyle: string }) => void;
  onClose: () => void;
  isSaving: boolean;
}

const STRENGTHS_OPTIONS =
  ONBOARDING_QUESTIONS.find((q) => q.key === 'strengths')?.options ||
  [];
const WORKSTYLE_OPTIONS =
  ONBOARDING_QUESTIONS.find((q) => q.key === 'workStyle')?.options ||
  [];

export const SkillInventoryPanel: React.FC<
  SkillInventoryPanelProps
> = ({ strengths, workStyle, onSave, onClose, isSaving }) => {
  const parseValues = (str: string) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const [selectedStrengths, setSelectedStrengths] = useState<
    string[]
  >(parseValues(strengths));
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<
    string[]
  >(parseValues(workStyle));

  const toggleStrength = (value: string) => {
    setSelectedStrengths((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const toggleWorkStyle = (value: string) => {
    setSelectedWorkStyle((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSave = () => {
    onSave({
      strengths: selectedStrengths.join(', '),
      workStyle: selectedWorkStyle.join(', '),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-medium text-gray-900">
              Skill Inventory
            </h2>
            <p className="text-sm text-gray-500">
              Your natural abilities and preferred work style.
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
          {/* Strengths Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Natural Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {STRENGTHS_OPTIONS.map((opt) => {
                const isSelected = selectedStrengths.includes(
                  opt.value
                );
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleStrength(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Style Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Preferred Work Style
            </h3>
            <div className="flex flex-wrap gap-2">
              {WORKSTYLE_OPTIONS.map((opt) => {
                const isSelected = selectedWorkStyle.includes(
                  opt.value
                );
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleWorkStyle(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-700">
            Your skills shape the resources and guidance Giya
            provides.
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
