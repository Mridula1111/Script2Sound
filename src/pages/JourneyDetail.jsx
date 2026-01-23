import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { learningApi } from "../services/learning-api";
import JourneyTimeline from "../components/JourneyTimeline";

export default function JourneyDetail() {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        setLoading(true);
        console.log("Loading journey:", journeyId);
        const journeyData = await learningApi.getJourney(journeyId);
        console.log("Journey data received:", journeyData);
        setJourney(journeyData);
        setError(null);
      } catch (err) {
        console.error("Failed to load journey:", err);
        setError(`Failed to load journey: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (journeyId) {
      loadJourney();
    }
  }, [journeyId]);

  const handlePause = async () => {
    try {
      await learningApi.pauseJourney(journeyId);
      setJourney((prev) => ({ ...prev, status: "paused" }));
    } catch (err) {
      setError("Failed to pause journey.");
    }
  };

  const handleResume = async () => {
    try {
      await learningApi.resumeJourney(journeyId);
      setJourney((prev) => ({ ...prev, status: "in-progress" }));
    } catch (err) {
      setError("Failed to resume journey.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || (!loading && !journey)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learning-assistant")}
            className="text-blue-400 hover:text-blue-300 mb-4 transition"
          >
            ← Back to Curricula
          </button>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-white font-bold mb-2">Error Loading Journey</h2>
            <p className="text-red-200 mb-4">{error || "Journey data could not be loaded"}</p>
            <p className="text-gray-400 text-sm">Journey ID: {journeyId}</p>
            <button
              onClick={() => navigate("/learning-assistant")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/learning-assistant")}
            className="text-blue-400 hover:text-blue-300 mb-4 transition"
          >
            ← Back to Curricula
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            {journey.unitName}
          </h1>
          <p className="text-gray-300">Your personalized learning journey</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Status & Controls */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-white font-semibold capitalize text-lg">
                {journey.status}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Attempt</p>
              <p className="text-white font-semibold text-lg">
                #{journey.attemptNumber}
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap">
            {journey.status === "in-progress" ? (
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition"
              >
                Pause Journey
              </button>
            ) : journey.status === "paused" ? (
              <button
                onClick={handleResume}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition"
              >
                Resume Journey
              </button>
            ) : null}

            <button
              onClick={() => navigate("/learning-assistant")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Journey Progress with Timeline */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Journey Progress</h2>
          
          <div className="space-y-4">
            {/* Unit Info */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Current Unit</p>
              <p className="text-white font-semibold">{journey.unitName}</p>
            </div>

            {/* Current Stage */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Current Stage</p>
              <p className="text-white font-semibold">
                Stage {journey.currentStageIndex + 1}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Completed Stages: {journey.completedStages?.length || 0}
              </p>
            </div>
          </div>

          {/* Timeline Component (Phase 5) */}
          <div className="mt-6">
            <JourneyTimeline 
              journey={journey} 
              onStageClick={(stageId, stageIndex) => {
                console.log('Stage clicked:', stageId, stageIndex);
              }}
            />
          </div>

          {/* Generated Notes (Phase 4) */}
          {journey.generatedNotes && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Study Notes</h3>
              <div className="bg-gray-700 rounded-lg p-4 text-gray-300">
                <p>{journey.generatedNotes.substring(0, 200)}...</p>
                <p className="text-gray-400 text-sm mt-2">
                  Full notes coming in Phase 4 →
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
