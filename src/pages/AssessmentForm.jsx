import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { learningApi } from "../services/learning-api";

export default function AssessmentForm() {
  const { curriculumId } = useParams();
  const navigate = useNavigate();

  const [curriculum, setCurriculum] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch curriculum and generate questions
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        const currData = await learningApi.getCurriculumById(curriculumId);
        setCurriculum(currData);

        // Auto-select first unit
        if (currData.units.length > 0) {
          const firstUnit = currData.units[0];
          setSelectedUnit(firstUnit);

          // Generate questions for first unit
          const questionsData = await learningApi.generateAssessmentQuestions(
            curriculumId,
            firstUnit.name
          );
          setQuestions(questionsData.questions || []);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to load assessment:", err);
        setError("Failed to load assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [curriculumId]);

  const handleUnitChange = async (newUnit) => {
    try {
      setLoading(true);
      setSelectedUnit(newUnit);

      const questionsData = await learningApi.generateAssessmentQuestions(
        curriculumId,
        newUnit.name
      );
      setQuestions(questionsData.questions || []);
      setAnswers({}); // Reset answers
      setError(null);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("Failed to load questions for this unit.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitAssessment = async () => {
    // Validate all questions answered
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Format answers for submission
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        question: q.question,
        studentAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
      }));

      console.log("Submitting assessment with answers:", formattedAnswers);

      // Submit assessment
      const result = await learningApi.submitAssessment(
        curriculumId,
        selectedUnit.name,
        formattedAnswers
      );

      console.log("Assessment result:", result);

      // Create journey with assessment
      const journey = await learningApi.createJourney(
        curriculumId,
        selectedUnit.name,
        curriculum.subject,
        result.assessmentId,
        result.profile
      );

      console.log("Journey created:", journey);
      console.log("Navigating to:", `/learning-assistant/journey/${journey.journeyId}`);

      // Navigate to journey page
      if (journey && journey.journeyId) {
        navigate(`/learning-assistant/journey/${journey.journeyId}`);
      } else {
        console.error("Invalid journey response:", journey);
        setError("Journey creation failed: Invalid response from server");
      }
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      setError(`Failed to submit assessment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !curriculum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            {curriculum?.name}
          </h1>
          <p className="text-gray-300">
            Quick assessment to understand your current knowledge level
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Unit Selector */}
        {curriculum && curriculum.units.length > 1 && (
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">
              Select Unit to Assess:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {curriculum.units.map((unit, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUnitChange(unit)}
                  className={`p-3 rounded-lg transition text-sm ${
                    selectedUnit?.name === unit.name
                      ? "bg-blue-600 text-white border border-blue-400"
                      : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {unit.name.split(":")[1]?.trim() || unit.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Questions Form */}
        {selectedUnit && questions.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-white">
              {selectedUnit.name}
            </h2>
            <p className="text-gray-400">
              Answer the following {questions.length} questions to assess your knowledge
            </p>

            {questions.map((question, idx) => (
              <div
                key={question.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
              >
                {/* Question */}
                <div className="mb-4">
                  <p className="text-white font-semibold">
                    Question {idx + 1} of {questions.length}
                  </p>
                  <p className="text-gray-200 mt-2">{question.question}</p>
                </div>

                {/* Answers */}
                {question.type === "mcq" ? (
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="ml-3 text-gray-300 hover:text-white">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            ))}

            {/* Submit Button */}
            <button
              onClick={handleSubmitAssessment}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-400">
            Loading questions...
          </div>
        )}
      </div>
    </div>
  );
}
