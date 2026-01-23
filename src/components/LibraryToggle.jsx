import React, { useState } from 'react';
import { BookOpen, Lightbulb, Settings } from 'lucide-react';

/**
 * Toggle component for switching between Learning Journey and Library
 * Allows students to access reference materials while studying
 */
const LibraryToggle = ({ isJourneyMode, onToggle, journey }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 border border-purple-500/30">
      {/* Toggle Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => onToggle(true)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              isJourneyMode
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Lightbulb size={18} />
            Learning Journey
          </button>

          <button
            onClick={() => onToggle(false)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              !isJourneyMode
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <BookOpen size={18} />
            Knowledge Library
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
          title="Library settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-white mb-3">Library Preferences</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Show related topics sidebar</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Enable cross-references</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Show difficulty level indicators</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Save bookmarks locally</span>
            </label>
          </div>
        </div>
      )}

      {/* Mode Info */}
      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded text-sm text-blue-200">
        {isJourneyMode ? (
          <p>
            <strong>Journey Mode:</strong> Follow your personalized learning path with guided content, quizzes, and progress tracking.
          </p>
        ) : (
          <p>
            <strong>Library Mode:</strong> Access comprehensive reference materials, alternative explanations, and supplementary resources.
          </p>
        )}
      </div>

      {/* Journey Progress Indicator */}
      {isJourneyMode && journey && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
          <p className="text-sm text-green-300">
            <strong>Unit:</strong> {journey.unitName} • <strong>Progress:</strong> {journey.completedStages?.length || 0} stages completed
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryToggle;
