import React, { useState, useEffect } from 'react';
import { ONBOARDING_QUESTIONS } from '../constants';
import { UserProfile } from '../types';
import { suggestOnboardingAnswers } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({});

  // State for single text input answers
  const [inputValue, setInputValue] = useState('');

  // State for multi-select answers (array of strings)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    []
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState(false);

  const question = ONBOARDING_QUESTIONS[currentStep];
  const progress =
    ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  useEffect(() => {
    // Reset local state when step changes
    setInputValue('');
    setSelectedOptions([]);
    setSuggestions([]);
  }, [currentStep]);

  const handleNext = (valueOverride?: string | string[]) => {
    let finalValue: string;

    if (valueOverride) {
      if (Array.isArray(valueOverride)) {
        finalValue = valueOverride.join(', ');
      } else {
        finalValue = valueOverride;
      }
    } else {
      // If no override, use current local state
      if (question.type === 'multiselect') {
        finalValue = selectedOptions.join(', ');
      } else {
        finalValue = inputValue;
      }
    }

    if (!finalValue && !valueOverride) return; // Guard against empty

    const newAnswers = { ...answers, [question.key]: finalValue };
    setAnswers(newAnswers);

    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newAnswers as UserProfile);
    }
  };

  const toggleOption = (value: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleHelpMeOut = async () => {
    setIsLoadingSuggestions(true);
    try {
      const context = JSON.stringify(answers);
      const suggested = await suggestOnboardingAnswers(
        question.question,
        context
      );
      setSuggestions(suggested);
    } catch (e) {
      console.error('Context processing error:', e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const renderSingleSelect = () => (
    <div className="grid grid-cols-1 gap-4 pt-4">
      {question.options?.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleNext(opt.value)}
          className="w-full p-6 text-xl text-left border-2 border-gray-100 rounded-2xl hover:border-[#0551BA] hover:bg-blue-50 transition-all flex justify-between items-center group">
          <span className="text-gray-900 font-medium">
            {opt.label}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0551BA] font-bold">
            →
          </span>
        </button>
      ))}
    </div>
  );

  const renderMultiSelect = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {question.options?.map((opt) => {
          const isSelected = selectedOptions.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`w-full p-4 text-lg text-left border-2 rounded-2xl transition-all flex justify-between items-center ${
                isSelected
                  ? 'border-[#0551BA] bg-blue-50 text-[#0551BA]'
                  : 'border-gray-100 hover:border-blue-200 text-gray-700'
              }`}>
              <span className="font-medium">{opt.label}</span>
              {isSelected && (
                <span className="text-[#0551BA]">
                  <svg
                    className="w-6 h-6"
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
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleNext()}
          disabled={selectedOptions.length === 0}
          className="px-8 py-3 bg-[#0551BA] text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Continue
        </button>
      </div>
    </div>
  );

  const renderTextInput = () => (
    <>
      <textarea
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={
          (question as { placeholder?: string }).placeholder
        }
        className="w-full text-2xl font-light bg-transparent border-b-2 border-gray-200 focus:border-[#0551BA] outline-none py-4 resize-none transition-colors"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
            e.preventDefault();
            handleNext();
          }
        }}
      />

      <div className="min-h-[80px]">
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInputValue(s)}
                className="px-4 py-2 bg-blue-50 text-[#0551BA] text-sm font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                {s}
              </button>
            ))}
            <button
              onClick={() => setSuggestions([])}
              className="px-4 py-2 text-gray-400 text-sm hover:text-gray-600">
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={handleHelpMeOut}
            disabled={isLoadingSuggestions}
            className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#0551BA] transition-colors">
            {isLoadingSuggestions ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-200 border-t-[#0551BA] rounded-full animate-spin" />
                <span>Generating ideas...</span>
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Help me out</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-gray-400">
          Press <span className="font-bold">Enter</span> to continue
        </p>
        <button
          onClick={() => handleNext()}
          disabled={!inputValue.trim()}
          className="px-8 py-3 bg-[#0551BA] text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Continue
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-12 py-12">
      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
        <div
          className="bg-[#0551BA] h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4 w-full text-center">
        <span className="text-sm font-medium text-[#0551BA] uppercase tracking-widest">
          Step {currentStep + 1} of {ONBOARDING_QUESTIONS.length}
        </span>
        <h2 className="text-4xl font-serif font-medium leading-tight text-gray-900">
          {question.question}
        </h2>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">
          {question.sub}
        </p>
      </div>

      <div className="w-full space-y-6">
        {question.type === 'select'
          ? renderSingleSelect()
          : question.type === 'multiselect'
            ? renderMultiSelect()
            : renderTextInput()}
      </div>

      <div className="pt-8 text-center max-w-md">
        <p className="text-sm text-gray-400 leading-relaxed italic">
          &quot;Every journey is unique. My goal is to build a compass
          that points directly toward your potential.&quot;
        </p>
      </div>
    </div>
  );
};
