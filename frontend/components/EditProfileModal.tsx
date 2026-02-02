'use client';

import React, { useState } from 'react';
import { UserProfile, LifeStage } from '@/types';
import { ONBOARDING_QUESTIONS } from '@/constants';

interface EditProfileModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const LIFE_STAGE_OPTIONS: { label: string; value: LifeStage }[] = [
  { label: 'High School', value: 'high-school' },
  { label: 'University', value: 'university' },
  { label: 'Professional', value: 'professional' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  const textFields = ONBOARDING_QUESTIONS.filter(
    (q) => q.key !== 'lifeStage'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-medium text-gray-900">
            Edit Your Profile
          </h2>
          <p className="text-sm text-gray-500">
            Update your answers to recalibrate your compass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Life Stage
            </label>
            <div className="flex gap-2">
              {LIFE_STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      lifeStage: opt.value,
                    }))
                  }
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
                    formData.lifeStage === opt.value
                      ? 'bg-[#0551BA] text-white border-[#0551BA]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0551BA] hover:text-[#0551BA]'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {textFields.map((q) => {
            const key = q.key as keyof UserProfile;
            return (
              <div key={q.key} className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {q.question}
                </label>
                <textarea
                  value={(formData[key] as string) || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={q.placeholder}
                  rows={2}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0551BA] resize-none transition-colors"
                />
              </div>
            );
          })}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              Saving will regenerate your career paths based on your
              updated profile.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#0551BA] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save & Regenerate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
