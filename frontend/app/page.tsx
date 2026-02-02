'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { CareerCard } from '@/components/CareerCard';
import { Timeline } from '@/components/Timeline';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AppState, CareerPath, UserProfile } from '@/types';
import {
  generateLifeStoryStructure,
  generateSceneSketch,
  askGiya,
  analyzeAcademicRecord,
} from '@/services/geminiService';
import {
  UserService,
  ChatMessage,
  Reflection,
} from '@/services/userService';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CareerInterestsPanel } from '@/components/CareerInterestsPanel';
import { SkillInventoryPanel } from '@/components/SkillInventoryPanel';
import { ReflectionsPanel } from '@/components/ReflectionsPanel';
import { DecisionSandbox } from '@/components/DecisionSandbox';
import { WhatChangedPanel } from '@/components/WhatChangedPanel';
import { MentorModePanel } from '@/components/MentorModePanel';
import { ContextPanel } from '@/components/ContextPanel';
import Image from 'next/image';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<AppState>({
    step: 'dashboard',
    profile: null,
    suggestedCareers: [],
    selectedCareer: null,
    isGenerating: false,
    lifePreviewScenes: null,
    academicAnalysis: null,
    isAnalyzingRecord: false,
  });

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(
    null
  );
  const [isAsking, setIsAsking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notebook Panel State
  const [showCareerInterests, setShowCareerInterests] =
    useState(false);
  const [showSkillInventory, setShowSkillInventory] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoadingReflections, setIsLoadingReflections] =
    useState(false);

  // Strategic Features State
  const [showDecisionSandbox, setShowDecisionSandbox] =
    useState(false);
  const [showWhatChanged, setShowWhatChanged] = useState(false);
  const [showMentorMode, setShowMentorMode] = useState(false);
  const [isProcessingReassessment, setIsProcessingReassessment] =
    useState(false);

  // Saved Paths & Previews State
  const [savedPathIds, setSavedPathIds] = useState<Set<string>>(
    new Set()
  );
  const [savedPreviews, setSavedPreviews] = useState<
    Array<{ id: string; careerId: string; careerTitle: string }>
  >([]);
  const [completedMilestones, setCompletedMilestones] = useState<
    Set<string>
  >(new Set());
  const [growthCheckpoint, setGrowthCheckpoint] = useState<{
    shouldPrompt: boolean;
    type?: string;
  } | null>(null);

  // Initial Load and Redirect logic
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const loadDashboard = async () => {
        try {
          const res = await UserService.fetchDashboardData();
          if (res.status === 'needs_onboarding') {
            router.push('/onboarding');
          } else if (res.status === 'success' && res.data) {
            setState((prev) => ({
              ...prev,
              profile: res.data!.profile,
              suggestedCareers: res.data!.careers,
              isGenerating: false,
            }));

            // Fetch saved paths, previews, milestones, and growth checkpoint
            const [paths, previews, milestones, checkpoint] =
              await Promise.all([
                UserService.getSavedPaths(),
                UserService.getSavedPreviews(),
                UserService.getMilestones(),
                UserService.getGrowthCheckpoint(),
              ]);

            setSavedPathIds(new Set(paths.map((p) => p.careerId)));
            setSavedPreviews(
              previews.map((p) => ({
                id: p.id,
                careerId: p.careerId,
                careerTitle: p.careerTitle,
              }))
            );
            setCompletedMilestones(
              new Set(
                milestones.map(
                  (m) => `${m.careerId}:${m.milestoneId}`
                )
              )
            );
            setGrowthCheckpoint(checkpoint);
          }
        } catch (error) {
          console.error('Failed to load dashboard data', error);
          toast.error('Failed to load dashboard data');
        }
      };

      loadDashboard();
    }
  }, [user, isLoading, router]);

  const handleRegenerate = async () => {
    setState((prev) => ({ ...prev, isGenerating: true }));
    try {
      const res = await UserService.regenerateCareers();
      setState((prev) => ({
        ...prev,
        suggestedCareers: res.careers,
        isGenerating: false,
      }));
    } catch (err) {
      console.error('Failed to regenerate careers', err);
      toast.error('Failed to regenerate careers');
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleSelectCareer = (career: CareerPath) => {
    setState((prev) => ({
      ...prev,
      step: 'career-details',
      selectedCareer: career,
      lifePreviewScenes: null,
    }));
    setChatMessages([]);
    setChatSessionId(null);
    setChatInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !state.profile) return;

    setState((prev) => ({ ...prev, isAnalyzingRecord: true }));

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error('Failed to read the uploaded file');
      setState((prev) => ({ ...prev, isAnalyzingRecord: false }));
    };
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const contextCareer =
        state.selectedCareer || state.suggestedCareers[0];
      const analysis = await analyzeAcademicRecord(
        state.profile!,
        contextCareer,
        base64,
        file.type
      );
      setState((prev) => ({
        ...prev,
        academicAnalysis: analysis,
        isAnalyzingRecord: false,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewLife = async () => {
    if (!state.profile || !state.selectedCareer) return;
    setState((prev) => ({ ...prev, isGenerating: true }));

    try {
      const scenes = await generateLifeStoryStructure(
        state.profile,
        state.selectedCareer
      );
      setState((prev) => ({
        ...prev,
        lifePreviewScenes: scenes,
        isGenerating: false,
      }));

      for (let i = 0; i < scenes.length; i++) {
        const imageUrl = await generateSceneSketch(
          scenes[i].imagePrompt
        );
        if (imageUrl) {
          setState((prev) => {
            if (!prev.lifePreviewScenes) return prev;
            const updated = [...prev.lifePreviewScenes];
            updated[i] = { ...updated[i], imageUrl };
            return { ...prev, lifePreviewScenes: updated };
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate life preview');
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleAsk = async () => {
    if (!chatInput.trim() || !state.profile) return;
    const question = chatInput.trim();
    setChatInput('');
    setIsAsking(true);

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: chatSessionId || '',
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    const context = state.selectedCareer
      ? `Career: ${state.selectedCareer.title}`
      : 'General Discovery';

    try {
      // Auto-create session on first message
      let activeSessionId = chatSessionId;
      if (!activeSessionId) {
        const session = await UserService.createChatSession(
          state.selectedCareer?.title || 'General'
        );
        activeSessionId = session.id;
        setChatSessionId(activeSessionId);
      }

      const resp = await askGiya(
        state.profile,
        context,
        question,
        activeSessionId
      );

      const modelMsg: ChatMessage = {
        id: `temp-${Date.now()}-resp`,
        sessionId: activeSessionId,
        role: 'model',
        content: resp,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to get a response from Giya');
    } finally {
      setIsAsking(false);
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    setIsSavingProfile(true);
    try {
      await UserService.saveProfile(updatedProfile);
      toast.success('Profile saved — regenerating career paths...');
      setIsEditingProfile(false);
      // Reload dashboard to trigger career regeneration
      const res = await UserService.fetchDashboardData();
      if (res.status === 'success' && res.data) {
        setState((prev) => ({
          ...prev,
          profile: res.data!.profile,
          suggestedCareers: res.data!.careers,
          selectedCareer: null,
          step: 'dashboard',
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ===== Notebook Panel Handlers =====

  const handleOpenReflections = async () => {
    setShowReflections(true);
    setIsLoadingReflections(true);
    try {
      const data = await UserService.getReflections();
      setReflections(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load reflections');
    } finally {
      setIsLoadingReflections(false);
    }
  };

  const handleAddReflection = async (content: string) => {
    try {
      const newReflection = await UserService.addReflection(content);
      setReflections((prev) => [newReflection, ...prev]);
      toast.success('Reflection saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save reflection');
      throw e;
    }
  };

  const handleDeleteReflection = async (id: string) => {
    try {
      await UserService.deleteReflection(id);
      setReflections((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete reflection');
    }
  };

  const handleReassessment = async (update: {
    type: 'setback' | 'opportunity' | 'values_shift' | 'life_event';
    description: string;
  }) => {
    if (!state.profile) return;
    setIsProcessingReassessment(true);
    try {
      // Add the life update as a reflection first
      await UserService.addReflection(
        `[${update.type.toUpperCase()}] ${update.description}`
      );

      // Trigger career path regeneration
      toast.success('Reassessing your path based on this update...');
      const res = await UserService.regenerateCareers();
      if (res.careers && res.careers.length > 0) {
        setState((prev) => ({
          ...prev,
          suggestedCareers: res.careers,
        }));
        toast.success(
          'Career paths updated based on your new context!'
        );
      }
      setShowWhatChanged(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to reassess path');
    } finally {
      setIsProcessingReassessment(false);
    }
  };

  const handleToggleSavePath = async (careerId: string) => {
    try {
      if (savedPathIds.has(careerId)) {
        await UserService.unsavePath(careerId);
        setSavedPathIds((prev) => {
          const next = new Set(prev);
          next.delete(careerId);
          return next;
        });
        toast.success('Path removed from favorites');
      } else {
        await UserService.savePath(careerId);
        setSavedPathIds((prev) => new Set(prev).add(careerId));
        toast.success('Path saved to favorites');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update saved paths');
    }
  };

  const handleDeletePreview = async (previewId: string) => {
    try {
      await UserService.deletePreview(previewId);
      setSavedPreviews((prev) =>
        prev.filter((p) => p.id !== previewId)
      );
      toast.success('Preview deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete preview');
    }
  };

  const handleToggleMilestone = async (
    careerId: string,
    milestoneId: string
  ) => {
    const key = `${careerId}:${milestoneId}`;
    try {
      if (completedMilestones.has(key)) {
        await UserService.uncompleteMilestone(careerId, milestoneId);
        setCompletedMilestones((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        toast.success('Milestone unmarked');
      } else {
        await UserService.completeMilestone(careerId, milestoneId);
        setCompletedMilestones((prev) => new Set(prev).add(key));
        toast.success('Milestone completed! 🎉');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update milestone');
    }
  };

  const handleDismissCheckpoint = async () => {
    if (growthCheckpoint?.type) {
      try {
        await UserService.markCheckpointPrompted(
          growthCheckpoint.type
        );
        setGrowthCheckpoint({ shouldPrompt: false });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSavePartialProfile = async (
    updates: Partial<UserProfile>
  ) => {
    if (!state.profile) return;
    setIsSavingProfile(true);
    try {
      const updatedProfile = { ...state.profile, ...updates };
      await UserService.saveProfile(updatedProfile);
      toast.success('Updated — regenerating career paths...');
      setShowCareerInterests(false);
      setShowSkillInventory(false);
      // Reload dashboard
      const res = await UserService.fetchDashboardData();
      if (res.status === 'success' && res.data) {
        setState((prev) => ({
          ...prev,
          profile: res.data!.profile,
          suggestedCareers: res.data!.careers,
          selectedCareer: null,
          step: 'dashboard',
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderAcademicAnalysis = () => {
    if (!state.academicAnalysis) return null;
    return (
      <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8">
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#0551BA]">
            Strategic Coursework
          </h4>
          <div className="space-y-4">
            {state.academicAnalysis.keyCourses.map((c, i) => (
              <div
                key={i}
                className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-900">
                    {c.name}
                  </span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded">
                    {c.relevance}% Relevance
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {c.why}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0551BA]">
              Future Academic Benchmarks
            </h4>
            {state.academicAnalysis.masterPrograms.map((p, i) => (
              <div
                key={i}
                className="space-y-2 p-4 border border-gray-50 rounded-xl">
                <p className="text-sm font-bold text-gray-900">
                  {p.program}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.universities.map((u, j) => (
                    <span
                      key={j}
                      className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600">
                      {u}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
          <div className="p-5 bg-[#0551BA]/5 rounded-2xl border border-[#0551BA]/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0551BA] mb-2">
              Compass Insight
            </h4>
            <p className="text-sm text-gray-700 font-serif italic leading-relaxed">
              &quot;{state.academicAnalysis.gpaInsight}&quot;
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCenter = () => {
    if (state.isGenerating && !state.lifePreviewScenes) {
      // Onboarding completion triggers loading while generating
      // OR initial dashboard load triggers generating
      if (state.suggestedCareers.length === 0)
        return <LoadingScreen />;
    }

    if (state.step === 'dashboard') {
      const isStudent =
        state.profile?.lifeStage === 'university' ||
        state.profile?.lifeStage === 'high-school';

      return (
        <div className="space-y-12 py-12">
          {/* Growth Checkpoint Banner */}
          {growthCheckpoint?.shouldPrompt && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <span className="text-2xl">
                    {growthCheckpoint.type === 'annual'
                      ? '🎯'
                      : growthCheckpoint.type === 'skill'
                        ? '🛠️'
                        : '🧭'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Time for a {growthCheckpoint.type} check-in!
                  </h3>
                  <p className="text-sm text-purple-700">
                    {growthCheckpoint.type === 'annual'
                      ? "It's been a while. Let's reflect on your progress and goals."
                      : growthCheckpoint.type === 'skill'
                        ? 'Review your skills and see what you have learned.'
                        : 'Your priorities may have evolved. Time to realign your goals.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReflections(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                  Start Reflection
                </button>
                <button
                  onClick={handleDismissCheckpoint}
                  className="p-2 text-purple-400 hover:text-purple-600 transition-colors"
                  title="Dismiss">
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
          )}

          <header className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-serif font-medium text-gray-900">
                  Pathways Dashboard
                </h2>
                <p className="text-gray-500 max-w-xl mt-2">
                  Curated strategic trajectories based on your{' '}
                  {state.profile?.lifeStage} context.
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={state.isGenerating}
                className="p-2 text-gray-400 hover:text-[#0551BA] hover:bg-blue-50 rounded-full transition-all"
                title="Regenerate Perspectives">
                <svg
                  className={`w-5 h-5 ${state.isGenerating ? 'animate-spin' : ''}`}
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
              </button>
            </div>
          </header>

          {isStudent && (
            <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0551BA]/5 rounded-bl-full -mr-8 -mt-8" />
              <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-medium text-gray-900">
                    Academic Strategic Center
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Align your current record with your mapped
                    horizons.
                  </p>
                </div>
                {!state.academicAnalysis &&
                  !state.isAnalyzingRecord && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-[#0551BA] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload Academic Record
                    </button>
                  )}
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.txt"
                />
              </div>

              {state.isAnalyzingRecord && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-10 h-10 border-4 border-[#0551BA] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-[#0551BA] uppercase tracking-widest animate-pulse">
                    Deep Thinking...
                  </span>
                </div>
              )}

              {state.academicAnalysis && renderAcademicAnalysis()}
            </section>
          )}

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Primary Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {Array.isArray(state.suggestedCareers) &&
                state.suggestedCareers.map((career) => (
                  <CareerCard
                    key={career.id}
                    career={career}
                    onClick={() => handleSelectCareer(career)}
                  />
                ))}
            </div>
          </div>
        </div>
      );
    }

    if (state.step === 'career-details' && state.selectedCareer) {
      const career = state.selectedCareer;
      // Reuse detailed view logic
      return (
        <div className="space-y-16 py-12">
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                step: 'dashboard',
                selectedCareer: null,
              }))
            }
            className="flex items-center gap-2 text-[#0551BA] font-medium hover:underline group">
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>{' '}
            Back to Pathways
          </button>

          <header className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-6xl font-serif font-medium text-gray-900 mb-6">
                  {career.title}
                </h1>
                <p className="text-xl text-gray-500 leading-relaxed max-w-3xl font-light">
                  {career.lifestyle}
                </p>
                {career.reason && (
                  <div className="mt-6 p-5 bg-[#0551BA]/5 rounded-2xl border border-[#0551BA]/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#0551BA] mb-2">
                      Compass Insight
                    </h4>
                    <p className="text-sm text-gray-700 font-serif italic leading-relaxed">
                      &quot;{career.reason}&quot;
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center text-center min-w-[140px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Horizon Fit
                </span>
                <span className="text-5xl font-serif font-bold text-[#0551BA]">
                  {Math.round(career.confidence * 100)}%
                </span>
              </div>
            </div>
          </header>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-serif font-medium">
                Strategic Timeline
              </h3>
              <span className="text-sm text-gray-400">
                Long-term 20-year projection
              </span>
            </div>
            <Timeline
              events={career.timeline}
              careerId={career.id}
              completedMilestones={completedMilestones}
              onToggleMilestone={(milestoneId) =>
                handleToggleMilestone(career.id, milestoneId)
              }
            />
          </section>

          {career.resources && career.resources.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-serif font-medium">
                  Learning Resources
                </h3>
                <span className="text-sm text-gray-400">
                  Curated for this pathway
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {career.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0551BA] px-2 py-0.5 rounded">
                        {resource.type}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {resource.difficulty}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {resource.whyItMatters}
                    </p>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {resource.timeCommitment}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.lifePreviewScenes && (
            <section className="bg-white space-y-32 py-16">
              {/* Scene Rendering */}
              {state.lifePreviewScenes.map((scene, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center max-w-5xl mx-auto`}>
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-[1px] bg-[#0551BA]/20" />
                      <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#0551BA]/40">
                        Moment {idx + 1}
                      </span>
                    </div>
                    <h4 className="text-4xl font-serif text-gray-900 leading-tight">
                      {scene.title}
                    </h4>
                    <p className="text-xl text-gray-600 leading-relaxed font-light italic opacity-90">
                      {scene.text}
                    </p>
                  </div>
                  <div className="flex-1 w-full relative group">
                    <Image
                      src={
                        scene.imageUrl ||
                        'https://placehold.co/800x600/e2e8f0/94a3b8?text=Drawing...'
                      }
                      alt={scene.title}
                      width={800}
                      height={600}
                      className="object-cover rounded-sm border border-gray-100 shadow-lg grayscale brightness-105 contrast-125"
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          {!state.lifePreviewScenes && (
            <div className="bg-gray-50 p-16 rounded-3xl border border-dashed border-gray-200 text-center space-y-8">
              <h3 className="text-3xl font-serif text-gray-900">
                Experience your possible future
              </h3>
              <button
                onClick={handlePreviewLife}
                className="px-12 py-4 bg-[#0551BA] text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Preview My Life
              </button>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderLeft = () => {
    // NotebookLM-inspired Sidebar
    if (!state.profile)
      return (
        <p className="text-sm p-4 text-gray-400">
          Loading Compass...
        </p>
      );

    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
            My Compass
          </h4>

          {/* User Notebooks Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              Profile & Context
            </button>
            <button
              onClick={() => setShowCareerInterests(true)}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </span>
              Career Interests
            </button>
            <button
              onClick={() => setShowSkillInventory(true)}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
              <span className="p-1.5 bg-green-50 text-green-600 rounded-md group-hover:bg-green-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </span>
              Skill Inventory
            </button>
            <button
              onClick={handleOpenReflections}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-md group-hover:bg-amber-100">
                <svg
                  className="w-4 h-4"
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
              </span>
              Reflections
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
            Mapped Horizons
          </h4>
          <div className="space-y-1">
            {Array.isArray(state.suggestedCareers) &&
              state.suggestedCareers.map((c) => (
                <div key={c.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelectCareer(c)}
                    className={`flex-1 flex items-center gap-3 p-2 rounded-lg text-sm transition-all group ${state.selectedCareer?.id === c.id ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${state.selectedCareer?.id === c.id ? 'bg-[#0551BA]' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                    />
                    {c.title}
                  </button>
                  <button
                    onClick={() => handleToggleSavePath(c.id)}
                    className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                    title={
                      savedPathIds.has(c.id)
                        ? 'Unsave path'
                        : 'Save path'
                    }>
                    <svg
                      className="w-4 h-4"
                      fill={
                        savedPathIds.has(c.id)
                          ? 'currentColor'
                          : 'none'
                      }
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Saved Paths Section */}
        {savedPathIds.size > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
              ⭐ Saved Paths
            </h4>
            <div className="space-y-1">
              {state.suggestedCareers
                .filter((c) => savedPathIds.has(c.id))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCareer(c)}
                    className="w-full flex items-center gap-2 p-2 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {c.title}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Life Previews Section */}
        {savedPreviews.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
              📖 Life Previews
            </h4>
            <div className="space-y-1">
              {savedPreviews.map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const career = state.suggestedCareers.find(
                        (c) => c.id === p.careerId
                      );
                      if (career) handleSelectCareer(career);
                    }}
                    className="flex-1 flex items-center gap-2 p-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {p.careerTitle}
                  </button>
                  <button
                    onClick={() => handleDeletePreview(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete preview">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Tools Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
            Strategic Tools
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => setShowDecisionSandbox(true)}
              disabled={state.suggestedCareers.length < 2}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </span>
              Decision Sandbox
            </button>
            <button
              onClick={() => setShowWhatChanged(true)}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
              <span className="p-1.5 bg-orange-50 text-orange-600 rounded-md group-hover:bg-orange-100">
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
              </span>
              What Changed?
            </button>
            <button
              onClick={() => setShowMentorMode(true)}
              className="w-full flex items-center gap-3 p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
              <span className="p-1.5 bg-teal-50 text-teal-600 rounded-md group-hover:bg-teal-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
              Mentor Mode
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </div>
    );
  };

  const renderRight = () => {
    return (
      <div className="space-y-6 h-full flex flex-col">
        {/* Context Section */}
        <div className="space-y-4">
          {!state.selectedCareer ? (
            <div className="max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
              <ContextPanel profile={state.profile} />
            </div>
          ) : (
            <>
              <h4 className="font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
                Context Memory
              </h4>

              <div className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">
                    <svg
                      className="w-4 h-4"
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
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">
                      Why this fits you
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {state.selectedCareer.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-gray-500 uppercase">
                  Outlook
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entry</span>
                    <span className="font-mono font-medium text-gray-900">
                      {state.selectedCareer.outlook.entrySalary}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Senior</span>
                    <span className="font-mono font-medium text-gray-900">
                      {state.selectedCareer.outlook.seniorSalary}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Growth</span>
                    <span className="font-mono font-medium text-green-600">
                      +{state.selectedCareer.outlook.growth}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Compass AI
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
              {state.selectedCareer
                ? 'Career-Context'
                : 'Profile-Context'}
            </span>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {chatMessages.length === 0 && (
              <div className="text-center space-y-2 py-8">
                <p className="text-xs text-gray-400">
                  {state.selectedCareer
                    ? `I have context on your ${state.profile?.lifeStage} background and this ${state.selectedCareer.title} path.`
                    : 'I have context on your profile, interests, and goals.'}
                </p>
                <p className="text-xs text-blue-500 font-medium">
                  Ask me anything.
                </p>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl text-xs text-gray-500 flex gap-1">
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                placeholder="Type a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <button
                onClick={handleAsk}
                disabled={!chatInput.trim() || isAsking}
                className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || (!state.profile && state.isGenerating)) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Layout
        left={renderLeft()}
        center={renderCenter()}
        right={renderRight()}
      />
      {isEditingProfile && state.profile && (
        <EditProfileModal
          profile={state.profile}
          onSave={handleProfileSave}
          onCancel={() => setIsEditingProfile(false)}
          isSaving={isSavingProfile}
        />
      )}
      {showCareerInterests && state.profile && (
        <CareerInterestsPanel
          interests={state.profile.interests}
          impactGoals={state.profile.impactGoals}
          onSave={(updates) => handleSavePartialProfile(updates)}
          onClose={() => setShowCareerInterests(false)}
          isSaving={isSavingProfile}
        />
      )}
      {showSkillInventory && state.profile && (
        <SkillInventoryPanel
          strengths={state.profile.strengths}
          workStyle={state.profile.workStyle}
          onSave={(updates) => handleSavePartialProfile(updates)}
          onClose={() => setShowSkillInventory(false)}
          isSaving={isSavingProfile}
        />
      )}
      {showReflections && (
        <ReflectionsPanel
          reflections={reflections}
          onAdd={handleAddReflection}
          onDelete={handleDeleteReflection}
          onClose={() => setShowReflections(false)}
          isLoading={isLoadingReflections}
        />
      )}
      {showDecisionSandbox && state.suggestedCareers.length > 1 && (
        <DecisionSandbox
          careers={state.suggestedCareers}
          onClose={() => setShowDecisionSandbox(false)}
        />
      )}
      {showWhatChanged && state.profile && (
        <WhatChangedPanel
          profile={state.profile}
          onSubmit={handleReassessment}
          onClose={() => setShowWhatChanged(false)}
          isProcessing={isProcessingReassessment}
        />
      )}
      {showMentorMode && (
        <MentorModePanel onClose={() => setShowMentorMode(false)} />
      )}
    </>
  );
}
