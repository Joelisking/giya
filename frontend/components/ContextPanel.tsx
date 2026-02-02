import React from 'react';
import { UserProfile } from '../types';

interface ContextPanelProps {
  profile: UserProfile | null;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  profile,
}) => {
  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <p>No context available yet.</p>
        <p>Complete your profile to see insights.</p>
      </div>
    );
  }

  // Helper to parse comma-separated strings
  const parseList = (str: string) => {
    if (!str) return [];
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const interests = parseList(profile.interests);
  const constraints = parseList(profile.constraints);
  const strengths = parseList(profile.strengths);
  const goals = parseList(profile.impactGoals);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          What Giya Knows
        </h2>
        <div
          className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
          title="Live Context"
        />
      </div>

      {/* Identity Card */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-serif text-lg">
            U
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              User Profile
            </h3>
            <p className="text-xs text-gray-500 capitalize">
              {profile.lifeStage.replace('-', ' ')}
            </p>
          </div>
        </div>
      </section>

      {/* Core Interests */}
      {interests.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>✨ Core Interests</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-100">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Work Style */}
      {profile.workStyle && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>⚡ Work Style</span>
          </h3>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
            {profile.workStyle}
          </div>
        </section>
      )}

      {/* Impact Goals (Motivations) */}
      {goals.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>🔥 Motivations</span>
          </h3>
          <div className="space-y-2">
            {goals.map((value, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-orange-500">Video</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strengths (Key Traits) */}
      {strengths.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>🧠 Strengths</span>
          </h3>
          <ul className="space-y-2">
            {strengths.map((trait, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                {trait}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Constraints */}
      {constraints.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>🚧 Constraints</span>
          </h3>
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-sm text-red-800 space-y-1">
            {constraints.map((constraint, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {constraint}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
