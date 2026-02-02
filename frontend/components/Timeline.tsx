import React from 'react';
import { TimelineEvent } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
  careerId?: string;
  completedMilestones?: Set<string>;
  onToggleMilestone?: (milestoneId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  careerId,
  completedMilestones,
  onToggleMilestone,
}) => {
  const isCompleted = (eventId: string) =>
    completedMilestones?.has(`${careerId}:${eventId}`) ?? false;

  return (
    <div className="relative border-l-2 border-gray-100 ml-3 space-y-12 pb-24">
      {events.map((event) => {
        const completed = isCompleted(event.id);
        return (
          <div key={event.id} className="relative pl-10">
            {/* Dot with optional checkmark */}
            <div
              className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full shadow-sm transition-all ${
                completed
                  ? 'bg-green-500 border-2 border-green-500'
                  : 'bg-white border-2 border-[#0551BA]'
              }`}>
              {completed && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
              <div className="min-w-[80px]">
                <span
                  className={`text-sm font-bold px-2 py-1 rounded ${
                    completed
                      ? 'text-green-700 bg-green-50'
                      : 'text-[#0551BA] bg-blue-50'
                  }`}>
                  Age {event.age}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {event.type}
                  </span>
                  {completed && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h4
                  className={`text-xl font-semibold ${
                    completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                  {event.label}
                </h4>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  {event.description}
                </p>

                {/* Milestone checkbox */}
                {onToggleMilestone && (
                  <button
                    onClick={() => onToggleMilestone(event.id)}
                    className={`mt-2 flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                      completed
                        ? 'text-green-700 bg-green-100 hover:bg-green-200'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}>
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-400'
                      }`}>
                      {completed && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    {completed ? 'Completed' : 'Mark as complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Continuing line gradient */}
      <div className="absolute bottom-0 left-[-2px] w-[2px] h-24 bg-gradient-to-b from-gray-100 to-transparent" />
    </div>
  );
};
