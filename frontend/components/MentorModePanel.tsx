'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

import { UserService } from '../services/userService';

interface MentorModePanelProps {
  onClose: () => void;
}

export const MentorModePanel: React.FC<MentorModePanelProps> = ({
  onClose,
}) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mentorEmail, setMentorEmail] = useState('');

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const res = await UserService.createShareLink();
      const link = `${window.location.origin}/share/${res.shareToken}`;
      setShareLink(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const sendToMentor = () => {
    if (mentorEmail && shareLink) {
      // In production, this would send an email invitation
      toast.success(`Invitation sent to ${mentorEmail}`);
      setMentorEmail('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif font-medium text-gray-900">
                Mentor Mode
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Share your career plan with a mentor or parent
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
          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Read-Only View
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your mentor can view your career paths, goals, and
                  progress but cannot make changes to your profile.
                </p>
              </div>
            </div>
          </div>

          {/* Generate Link */}
          {!shareLink ? (
            <div className="space-y-4">
              <button
                onClick={generateShareLink}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Generate Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Generated Link */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Your Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Send via Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Send via Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    placeholder="mentor@email.com"
                    className="flex-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={sendToMentor}
                    disabled={!mentorEmail}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* What They'll See */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              What They&apos;ll See
            </h3>
            <ul className="space-y-2">
              {[
                'Your career path recommendations',
                'Timeline and milestones',
                'Skills and growth areas',
                'Your goals and motivations',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
