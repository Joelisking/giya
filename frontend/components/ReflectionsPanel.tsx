'use client';

import React, { useState } from 'react';

export interface Reflection {
  id: string;
  content: string;
  createdAt: string;
}

interface ReflectionsPanelProps {
  reflections: Reflection[];
  onAdd: (content: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const ReflectionsPanel: React.FC<ReflectionsPanelProps> = ({
  reflections,
  onAdd,
  onDelete,
  onClose,
  isLoading,
}) => {
  const [newReflection, setNewReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newReflection.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newReflection.trim());
      setNewReflection('');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4 space-y-1 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif font-medium text-gray-900">
                Reflections
              </h2>
              <p className="text-sm text-gray-500">
                A living notebook for your thoughts and insights.
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
        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6">
          {/* New Reflection Input */}
          <div className="space-y-3">
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="What's on your mind? Write a reflection about your goals, progress, or insights..."
              rows={4}
              className="w-full text-sm p-4 bg-amber-50/50 border border-amber-200 rounded-xl outline-none focus:border-amber-400 resize-none transition-colors placeholder:text-amber-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={isSaving || !newReflection.trim()}
                className="px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Reflection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Reflections */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : reflections.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Past Reflections
              </h3>
              {reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="group p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {reflection.content}
                    </p>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(reflection.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(reflection.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">
                No reflections yet. Start journaling your thoughts
                above.
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 mx-8 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            <strong>Tip:</strong> Giya uses your reflections to
            provide more personalized guidance. Write about your
            goals, struggles, and discoveries.
          </p>
        </div>
      </div>
    </div>
  );
};
