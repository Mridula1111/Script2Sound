import React, { useState } from 'react';
import { CheckCircle, Circle, Lock, Zap } from 'lucide-react';

/**
 * Timeline component showing journey stages/checkpoints
 * Displays current progress and upcoming stages
 */
const JourneyTimeline = ({ journey, onStageClick }) => {
  const [expandedStage, setExpandedStage] = useState(null);

  // Define journey stages based on typical unit progression
  const stages = [
    {
      id: 'learn',
      name: 'Learn Content',
      description: 'Read and understand the core concepts',
      icon: 'book',
      estimatedTime: '30 mins',
      isCheckpoint: false,
    },
    {
      id: 'practice',
      name: 'Practice Problems',
      description: 'Solve guided practice problems',
      icon: 'pencil',
      estimatedTime: '20 mins',
      isCheckpoint: false,
    },
    {
      id: 'quiz1',
      name: 'Checkpoint Quiz 1',
      description: 'First assessment of understanding',
      icon: 'check',
      estimatedTime: '15 mins',
      isCheckpoint: true,
    },
    {
      id: 'advanced',
      name: 'Advanced Topics',
      description: 'Explore complex applications',
      icon: 'rocket',
      estimatedTime: '25 mins',
      isCheckpoint: false,
    },
    {
      id: 'quiz2',
      name: 'Checkpoint Quiz 2',
      description: 'Final mastery assessment',
      icon: 'crown',
      estimatedTime: '15 mins',
      isCheckpoint: true,
    },
    {
      id: 'review',
      name: 'Final Review',
      description: 'Consolidate learning',
      icon: 'star',
      estimatedTime: '10 mins',
      isCheckpoint: false,
    },
  ];

  const currentStageIndex = journey?.currentStageIndex || 0;
  const completedStages = journey?.completedStages || [];

  const getStageStatus = (stageIndex) => {
    if (completedStages.includes(stageIndex)) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    if (stageIndex > currentStageIndex) return 'locked';
    return 'completed';
  };

  const getStageIcon = (stage) => {
    switch (stage.icon) {
      case 'book':
        return '📖';
      case 'pencil':
        return '✏️';
      case 'check':
        return '✅';
      case 'rocket':
        return '🚀';
      case 'crown':
        return '👑';
      case 'star':
        return '⭐';
      default:
        return '📌';
    }
  };

  const totalProgress = (completedStages.length / stages.length) * 100;

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900">Learning Journey Timeline</h3>
          <span className="text-sm font-semibold text-blue-600">
            {completedStages.length}/{stages.length} Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative mt-8">
        {/* Connection Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stage Nodes */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            const isActive = index === currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center cursor-pointer group">
                {/* Node Circle */}
                <button
                  onClick={() => onStageClick?.(stage.id, index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all transform group-hover:scale-110 z-10 relative ${
                    status === 'completed'
                      ? 'bg-green-500 text-white shadow-lg'
                      : status === 'current'
                      ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200 animate-pulse'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={status === 'locked'}
                  title={stage.name}
                >
                  {status === 'completed' ? <CheckCircle size={20} /> : getStageIcon(stage)}
                </button>

                {/* Stage Info */}
                <div className="text-center max-w-xs">
                  <p
                    className={`text-xs font-bold ${
                      isActive ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {stage.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stage.estimatedTime}</p>

                  {/* Expandable Details */}
                  {expandedStage === index && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
                      <p>{stage.description}</p>
                      {stage.isCheckpoint && (
                        <p className="mt-1 text-blue-600 font-semibold">
                          <Zap size={12} className="inline mr-1" />
                          Checkpoint Assessment
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Toggle Details Button */}
                {(status === 'completed' || isActive) && (
                  <button
                    onClick={() => setExpandedStage(expandedStage === index ? null : index)}
                    className="text-xs mt-1 text-blue-500 hover:text-blue-700 underline"
                  >
                    {expandedStage === index ? 'Hide' : 'Details'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Actions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-900">Current Stage: {stages[currentStageIndex]?.name}</p>
        <p className="text-xs text-gray-600 mt-1">{stages[currentStageIndex]?.description}</p>

        <div className="flex gap-2 mt-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
            Continue Learning
          </button>
          {stages[currentStageIndex]?.isCheckpoint && (
            <button className="px-3 py-2 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">
              Take Checkpoint Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyTimeline;
