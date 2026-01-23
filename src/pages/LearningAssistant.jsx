import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { learningApi } from "../services/learning-api";

export default function LearningAssistant() {
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurricula();
  }, []);

  const fetchCurricula = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting fetch curricula...");
      // Group by subject and type
      const response = await learningApi.searchCurricula("");
      console.log("Got response:", response);
      setCurricula(response);
    } catch (err) {
      console.error("Failed to fetch curricula:", err);
      setError(`Failed to load curricula: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCurriculum = (curriculum) => {
    // Navigate to assessment form with curriculum ID
    navigate(`/learning-assistant/assessment/${curriculum._id}`, {
      state: { curriculum },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Learning Assistant</h1>
          <p className="text-gray-300 text-lg">
            AI-powered unit mastery with personalized learning journeys
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 mb-3">{error}</p>
            <button
              onClick={fetchCurricula}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Curricula Grid */}
        {!loading && curricula.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curricula.map((curriculum) => (
              <div
                key={curriculum._id}
                onClick={() => handleSelectCurriculum(curriculum)}
                className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm font-medium">
                    {curriculum.type}
                  </span>
                  <span className="text-gray-400 text-sm">{curriculum.units.length} units</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {curriculum.name}
                </h3>

                {/* Subject */}
                <p className="text-gray-400 mb-4">{curriculum.subject}</p>

                {/* Units Preview */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Units:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {curriculum.units.slice(0, 3).map((unit, idx) => (
                      <li key={idx} className="truncate">
                        • {unit.name}
                      </li>
                    ))}
                    {curriculum.units.length > 3 && (
                      <li className="text-gray-500">• +{curriculum.units.length - 3} more</li>
                    )}
                  </ul>
                </div>

                {/* CTA Button */}
                <button className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && curricula.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No curricula available. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
