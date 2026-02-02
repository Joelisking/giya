'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  UserService,
  SharedPlan,
} from '../../../services/userService';
import { Timeline } from '../../../components/Timeline';

export default function SharedPlanPage() {
  const params = useParams();
  const token = params?.token as string;
  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      UserService.getSharedPlan(token)
        .then(setPlan)
        .catch((err) => {
          console.error(err);
          setError(
            'Failed to load shared plan. It may have expired.'
          );
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">
            Loading shared view...
          </p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Unable to View Plan
          </h1>
          <p className="text-gray-500">{error || 'Plan not found'}</p>
        </div>
      </div>
    );
  }

  // Helper to safely parse lists
  const parseList = (str?: string) => {
    if (!str) return [];
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const interests = parseList(plan.profile.interests);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Read Only Header */}
      <div className="bg-[#0551BA] text-white px-6 py-3 text-center sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="text-xl">👀</span>
          <p className="text-sm font-medium">
            Read-Only Mode: Viewing a career plan shared by{' '}
            {plan.userEmail}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6 space-y-12">
        {/* Profile Header */}
        <header className="space-y-6 text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <span className="text-4xl">🧭</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">
            {plan.profile.firstName || 'User'}&apos;s Career Compass
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A strategic roadmap based on my values, interests, and
            goals.
          </p>

          {/* Profile Context Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize">
              {plan.profile.lifeStage.replace('-', ' ')}
            </span>
            {interests.slice(0, 3).map((interest, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </header>

        {/* Separator */}
        <div className="h-px bg-gray-200 w-full" />

        {/* Career Paths */}
        <div className="space-y-16">
          {plan.careers?.map((career, idx) => (
            <article
              key={career.id || idx}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Pathway Option {idx + 1}
                  </span>
                  <div className="flex bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(career.confidence * 100)}% Match
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl font-serif font-medium text-gray-900 mb-4">
                  {career.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                  {career.reason}
                </p>
              </div>

              <div className="p-8 md:p-10 bg-white">
                <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">
                  Projected Timeline
                </h3>
                {/* 
                  Timeline component might expect onToggleMilestone which is optional.
                  We pass undefined to signal read-only if it supports it, 
                  or just pass empty handler.
                  Actually Timeline props: onToggleMilestone?: ...
                  So omitting it is fine.
                */}
                <Timeline events={career.timeline} />
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 pb-8 text-gray-400 text-sm">
          <p>Generated by Giya Compass • AI Life Guidance</p>
        </footer>
      </main>
    </div>
  );
}
