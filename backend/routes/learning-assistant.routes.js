import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Curriculum from "../models/Curriculum.js";
import StudentAssessment from "../models/StudentAssessment.js";
import LearningJourney from "../models/LearningJourney.js";
import PopQuizResult from "../models/PopQuizResult.js";
import UploadedCurriculum from "../models/UploadedCurriculum.js";

const router = express.Router();

console.log("🎓 Learning Assistant routes initialized");

// Log all requests to this router
router.use((req, res, next) => {
  console.log(`📡 Learning API request: ${req.method} ${req.path}`);
  next();
});

// ========== CURRICULUM ENDPOINTS ==========

// Search curricula by subject and type
router.get("/curricula/search", protect, async (req, res) => {
  try {
    console.log("🔍 Curricula search endpoint called");
    const { subject, type } = req.query;

    const query = { isPreloaded: true };

    if (subject) {
      query.subject = new RegExp(subject, "i");
    }

    if (type) {
      query.type = type;
    }

    const curricula = await Curriculum.find(query);
    console.log(`✅ Found ${curricula.length} curricula`);
    res.json({ data: curricula });
  } catch (error) {
    console.error("Curriculum search error:", error);
    res.status(500).json({ message: "Failed to search curricula" });
  }
});

// Get curriculum details with units and subtopics
router.get("/curricula/:id", protect, async (req, res) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id);

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    res.json(curriculum);
  } catch (error) {
    console.error("Curriculum fetch error:", error);
    res.status(500).json({ message: "Failed to fetch curriculum" });
  }
});

// ========== ASSESSMENT ENDPOINTS ==========

// Generate 5 assessment questions
router.post("/assessment/generate-questions", protect, async (req, res) => {
  try {
    const { curriculumId, unitName } = req.body;

    if (!curriculumId || !unitName) {
      return res.status(400).json({ message: "Curriculum and unit name required" });
    }

    const curriculum = await Curriculum.findById(curriculumId);
    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    // Placeholder: Will integrate OpenAI in Phase 3
    const placeholderQuestions = [
      {
        id: "q1",
        question: "What is the definition of velocity?",
        type: "mcq",
        options: ["Rate of change of position", "Speed in one direction", "Total distance covered", "Acceleration vector"],
        correctAnswer: "Rate of change of position",
      },
      {
        id: "q2",
        question: "Calculate the momentum if mass = 5kg and velocity = 10m/s",
        type: "numerical",
        correctAnswer: "50",
      },
      {
        id: "q3",
        question: "What is Newton's second law?",
        type: "mcq",
        options: ["F = ma", "F = mv", "F = m/a", "F = a/m"],
        correctAnswer: "F = ma",
      },
      {
        id: "q4",
        question: "Evaluate the integral of 2x from 0 to 5",
        type: "numerical",
        correctAnswer: "25",
      },
      {
        id: "q5",
        question: "What is kinetic energy?",
        type: "mcq",
        options: ["0.5 * m * v^2", "m * g * h", "F * d", "m * v"],
        correctAnswer: "0.5 * m * v^2",
      },
    ];

    res.json({
      curriculumId,
      unitName,
      questions: placeholderQuestions,
      message: "Questions generated (Phase 1 placeholder)",
    });
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ message: "Failed to generate questions" });
  }
});

// Submit assessment and create knowledge profile
router.post("/assessment/submit", protect, async (req, res) => {
  try {
    console.log("📋 Assessment submit request received");
    console.log("Full req.body:", JSON.stringify(req.body));
    console.log("Body keys:", Object.keys(req.body));
    
    let { curriculumId, unitName, answers, questions } = req.body;
    console.log("Destructured values:");
    console.log("  curriculumId:", curriculumId, typeof curriculumId);
    console.log("  unitName:", unitName, typeof unitName);
    console.log("  answers:", answers?.length, "items");
    console.log("  questions:", questions?.length, "items");
    
    const questionsData = answers || questions;
    console.log("questionsData after fallback:", questionsData?.length, "items");
    console.log("Validation: curriculumId truthy?", !!curriculumId, "unitName truthy?", !!unitName, "questionsData truthy?", !!questionsData);

    if (!curriculumId || !unitName || !questionsData) {
      console.log("❌ Missing required fields validation failed");
      console.log("   curriculumId:", !curriculumId ? "MISSING" : "OK");
      console.log("   unitName:", !unitName ? "MISSING" : "OK");
      console.log("   questionsData:", !questionsData ? "MISSING" : "OK");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate score and profile
    let correctCount = 0;
    const profile = {};

    questionsData.forEach((q) => {
      if (q.studentAnswer === q.correctAnswer) {
        correctCount++;
      }
      // Placeholder: Map question to subtopic and assign level
      // In Phase 3, we'll have proper subtopic mapping
      profile[`Subtopic-${q.id}`] = q.isCorrect ? "Legend" : q.isCorrect === null ? "Pro" : "Noob";
    });

    const assessment = new StudentAssessment({
      userId: req.user.userId || req.user.id,
      curriculumId,
      unitName,
      questions: questionsData.map((q) => ({
        ...q,
        isCorrect: q.studentAnswer === q.correctAnswer,
      })),
      profile,
      totalScore: (correctCount / questionsData.length) * 100,
    });

    await assessment.save();

    res.json({
      assessmentId: assessment._id,
      score: assessment.totalScore,
      profile: assessment.profile,
      message: "Assessment submitted successfully",
    });
  } catch (error) {
    console.error("Assessment submission error:", error);
    res.status(500).json({ message: "Failed to submit assessment" });
  }
});

// ========== LEARNING JOURNEY ENDPOINTS ==========

// Create a new learning journey
router.post("/journey/create", protect, async (req, res) => {
  try {
    const { curriculumId, unitName, subject, assessmentId, studentProfile } = req.body;

    if (!curriculumId || !unitName || !assessmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if journey exists for this unit
    const existingJourney = await LearningJourney.findOne({
      userId: req.user.userId || req.user.id,
      curriculumId,
      unitName,
      status: { $in: ["in-progress", "paused"] },
    });

    if (existingJourney && existingJourney.attemptNumber === 1) {
      return res.json({ journeyId: existingJourney._id, message: "Journey already exists" });
    }

    // Archive previous attempt if re-attempting
    if (existingJourney) {
      existingJourney.status = "archived";
      await existingJourney.save();
    }

    const journey = new LearningJourney({
      userId: req.user.userId || req.user.id,
      curriculumId,
      unitName,
      subject,
      assessmentId,
      studentProfile,
      attemptNumber: existingJourney ? existingJourney.attemptNumber + 1 : 1,
    });

    await journey.save();

    res.json({
      journeyId: journey._id.toString(),
      status: journey.status,
      currentStageIndex: journey.currentStageIndex,
      message: "Learning journey created",
    });
  } catch (error) {
    console.error("Journey creation error:", error);
    res.status(500).json({ message: "Failed to create journey" });
  }
});

// Get journey state
router.get("/journey/:journeyId", protect, async (req, res) => {
  try {
    console.log("🔍 Getting journey:", req.params.journeyId);
    const journey = await LearningJourney.findById(req.params.journeyId)
      .populate("assessmentId")
      .populate("popQuizResults");

    console.log("Journey found:", !!journey);
    console.log("Journey data:", journey);

    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    if (journey.userId.toString() !== (req.user.userId || req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    console.log("✅ Returning journey to client");
    res.json({
      data: journey,
      message: "Journey retrieved successfully"
    });
  } catch (error) {
    console.error("Journey fetch error:", error);
    res.status(500).json({ message: "Failed to fetch journey" });
  }
});

// Pause journey
router.patch("/journey/:journeyId/pause", protect, async (req, res) => {
  try {
    const journey = await LearningJourney.findById(req.params.journeyId);

    if (!journey || journey.userId.toString() !== (req.user.userId || req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    journey.status = "paused";
    journey.pausedAt = new Date();
    await journey.save();

    res.json({ message: "Journey paused", status: journey.status });
  } catch (error) {
    console.error("Pause error:", error);
    res.status(500).json({ message: "Failed to pause journey" });
  }
});

// Resume journey
router.patch("/journey/:journeyId/resume", protect, async (req, res) => {
  try {
    const journey = await LearningJourney.findById(req.params.journeyId);

    if (!journey || journey.userId.toString() !== (req.user.userId || req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    journey.status = "in-progress";
    journey.pausedAt = null;
    await journey.save();

    res.json({ message: "Journey resumed", status: journey.status });
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ message: "Failed to resume journey" });
  }
});

// Update current stage
router.patch("/journey/:journeyId/update-stage", protect, async (req, res) => {
  try {
    const { stageIndex } = req.body;
    const journey = await LearningJourney.findById(req.params.journeyId);

    if (!journey || journey.userId.toString() !== (req.user.userId || req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    journey.currentStageIndex = stageIndex;
    if (!journey.completedStages.includes(stageIndex)) {
      journey.completedStages.push(stageIndex);
    }

    await journey.save();

    res.json({ message: "Stage updated", currentStageIndex: journey.currentStageIndex });
  } catch (error) {
    console.error("Stage update error:", error);
    res.status(500).json({ message: "Failed to update stage" });
  }
});

// ========== PLACEHOLDER ENDPOINTS FOR FUTURE PHASES ==========

router.post("/notes/generate", protect, (req, res) => {
  res.json({ message: "Notes generation - Phase 4" });
});

router.post("/quiz/generate", protect, (req, res) => {
  res.json({ message: "Quiz generation - Phase 7" });
});

router.post("/quiz/:quizId/submit", protect, (req, res) => {
  res.json({ message: "Quiz submission - Phase 7" });
});

export default router;
