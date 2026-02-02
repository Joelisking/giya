'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Onboarding } from '@/components/Onboarding';
import { UserProfile } from '@/types';
import { UserService } from '@/services/userService';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setIsSubmitting(true);
    try {
      await UserService.saveProfile(profile);
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLeft = () => (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Begin Journey
      </h3>
      <p className="text-sm text-gray-500">
        Answer the following questions to calibrate your compass.
      </p>
    </div>
  );

  const renderCenter = () => (
    <Onboarding onComplete={handleOnboardingComplete} />
  );

  const renderRight = () => (
    <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#0551BA]">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-gray-400 text-sm font-light">
        Your answers shape the strategic horizons we map for you.
      </p>
    </div>
  );

  return (
    <Layout
      left={renderLeft()}
      center={renderCenter()}
      right={renderRight()}
    />
  );
}
