const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const LEARNING_API_URL = `${API_BASE_URL}/api/learning`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Create fetch headers with auth
const createHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const learningApi = {
  // ========== CURRICULUM ENDPOINTS ==========

  /**
   * Search curricula by subject and type
   * GET /curricula/search?subject=Physics&type=CBSE
   */
  async searchCurricula(query = "", type = "", subject = "") {
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (type) params.append("type", type);
      if (subject) params.append("subject", subject);

      const url = `${LEARNING_API_URL}/curricula/search?${params}`;
      console.log(`Fetching from: ${url}`);
      
      const response = await fetch(url, {
        headers: createHeaders(),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Error response:", error);
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      
      const data = await response.json();
      console.log("Curricula response:", data);
      return data.data || data;
    } catch (error) {
      console.error("Failed to search curricula:", error.message);
      throw error;
    }
  },

  /**
   * Get full curriculum details with all units and subtopics
   * GET /curricula/:id
   */
  async getCurriculumById(curriculumId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/curricula/${curriculumId}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch curriculum");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch curriculum:", error);
      throw error;
    }
  },

  // ========== ASSESSMENT ENDPOINTS ==========

  /**
   * Generate 5 assessment questions for a unit
   * POST /assessment/generate-questions
   * Body: { curriculumId, unitName }
   */
  async generateAssessmentQuestions(curriculumId, unitName) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/assessment/generate-questions`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ curriculumId, unitName }),
      });
      if (!response.ok) throw new Error("Failed to generate questions");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to generate assessment questions:", error);
      throw error;
    }
  },

  /**
   * Submit assessment answers and calculate knowledge profile
   * POST /assessment/submit
   * Body: { curriculumId, unitName, answers: [{ questionId, selectedAnswer }] }
   */
  async submitAssessment(curriculumId, unitName, answers) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/assessment/submit`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ curriculumId, unitName, answers }),
      });
      if (!response.ok) throw new Error("Failed to submit assessment");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      throw error;
    }
  },

  // ========== JOURNEY ENDPOINTS ==========

  /**
   * Create a new learning journey for a curriculum
   * POST /journey/create
   * Body: { curriculumId, unitName, subject, assessmentId, studentProfile }
   */
  async createJourney(curriculumId, unitName, subject, assessmentId, studentProfile) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/create`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ curriculumId, unitName, subject, assessmentId, studentProfile }),
      });
      if (!response.ok) throw new Error("Failed to create journey");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to create journey:", error);
      throw error;
    }
  },

  /**
   * Get journey state (fully populated with curriculum, assessment, quizzes)
   * GET /journey/:journeyId
   */
  async getJourney(journeyId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/${journeyId}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch journey");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch journey:", error);
      throw error;
    }
  },

  /**
   * Get all journeys for current user
   * GET /journey/user/all
   */
  async getUserJourneys() {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/user/all`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch journeys");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch user journeys:", error);
      throw error;
    }
  },

  /**
   * Pause a learning journey
   * PATCH /journey/:journeyId/pause
   */
  async pauseJourney(journeyId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/${journeyId}/pause`, {
        method: "PATCH",
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error("Failed to pause journey");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to pause journey:", error);
      throw error;
    }
  },

  /**
   * Resume a learning journey
   * PATCH /journey/:journeyId/resume
   */
  async resumeJourney(journeyId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/${journeyId}/resume`, {
        method: "PATCH",
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error("Failed to resume journey");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to resume journey:", error);
      throw error;
    }
  },

  /**
   * Update current stage in journey (mark as completed, move to next)
   * PATCH /journey/:journeyId/update-stage
   * Body: { stageIndex, completed: boolean }
   */
  async updateJourneyStage(journeyId, stageIndex, completed = true) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/journey/${journeyId}/update-stage`, {
        method: "PATCH",
        headers: createHeaders(),
        body: JSON.stringify({ stageIndex, completed }),
      });
      if (!response.ok) throw new Error("Failed to update stage");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to update journey stage:", error);
      throw error;
    }
  },

  // ========== NOTES ENDPOINTS (Phase 4) ==========

  /**
   * Generate study notes for a unit (placeholder for Phase 4)
   * POST /notes/generate
   * Body: { journeyId }
   */
  async generateNotes(journeyId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/notes/generate`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ journeyId }),
      });
      if (!response.ok) throw new Error("Failed to generate notes");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to generate notes:", error);
      throw error;
    }
  },

  // ========== QUIZ ENDPOINTS (Phase 7) ==========

  /**
   * Generate pop quiz for a unit (placeholder for Phase 7)
   * POST /quiz/generate
   * Body: { journeyId }
   */
  async generateQuiz(journeyId) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/quiz/generate`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ journeyId }),
      });
      if (!response.ok) throw new Error("Failed to generate quiz");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      throw error;
    }
  },

  /**
   * Submit quiz answers (placeholder for Phase 7)
   * POST /quiz/:quizId/submit
   * Body: { answers: [{ questionId, selectedAnswer }] }
   */
  async submitQuiz(quizId, answers) {
    try {
      const response = await fetch(`${LEARNING_API_URL}/quiz/${quizId}/submit`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error("Failed to submit quiz");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      throw error;
    }
  },
};
