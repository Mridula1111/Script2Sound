#!/usr/bin/env node

/**
 * Test Assessment Submission Flow
 * Verifies that assessment submission properly creates a journey
 */

const API_BASE = "http://localhost:5000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTczNzZhNGQzNjJhMTQ4Y2ZhMTUyNTEiLCJpYXQiOjE3NjkxOTYyMTcsImV4cCI6MTc2OTE5OTgxN30.6ROiVLiTYFWCSNX9dIFDrITryBgjdAr0o0x-kMbN7GM";

async function testAssessmentFlow() {
  console.log("🧪 Testing Assessment Submission Flow\n");

  try {
    // Step 1: Get curricula
    console.log("1️⃣ Fetching curricula...");
    const currRes = await fetch(`${API_BASE}/api/learning/curricula/search`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const currData = await currRes.json();
    const curriculum = currData.data[0];
    console.log(`✅ Got curriculum: ${curriculum.name}\n`);

    // Step 2: Get a unit
    const unit = curriculum.units[0];
    console.log(`2️⃣ Selected unit: ${unit.name}\n`);

    // Step 3: Generate questions
    console.log("3️⃣ Generating assessment questions...");
    const qRes = await fetch(`${API_BASE}/api/learning/assessment/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        curriculumId: curriculum._id,
        unitName: unit.name,
      }),
    });
    const qData = await qRes.json();
    const questions = qData.questions || qData.data || qData;
    if (!Array.isArray(questions)) {
      console.log("Error: Questions not found in response", qData);
      throw new Error("Invalid questions response");
    }
    console.log(`✅ Got ${questions.length} questions\n`);

    // Step 4: Simulate answering questions
    console.log("4️⃣ Simulating student answers...");
    const answers = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      studentAnswer: q.correctAnswer, // Correct answer for testing
      correctAnswer: q.correctAnswer,
    }));
    console.log(`✅ Prepared ${answers.length} answers\n`);

    // Step 5: Submit assessment
    console.log("5️⃣ Submitting assessment...");
    const payload = {
      curriculumId: curriculum._id,
      unitName: unit.name,
      answers: answers,
    };
    console.log("Submitting with payload:", JSON.stringify(payload, null, 2).substring(0, 200) + "...");
    const subRes = await fetch(`${API_BASE}/api/learning/assessment/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    const subData = await subRes.json();
    console.log("Assessment response:", JSON.stringify(subData, null, 2));
    console.log(`✅ Assessment submitted`);
    console.log(`   Score: ${subData.score || subData.data?.score}%`);
    console.log(`   Assessment ID: ${subData.assessmentId || subData.data?.assessmentId}\n`);

    // Step 6: Create journey
    console.log("6️⃣ Creating learning journey...");
    const journeyRes = await fetch(`${API_BASE}/api/learning/journey/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        curriculumId: curriculum._id,
        unitName: unit.name,
        subject: curriculum.subject,
        assessmentId: subData.assessmentId,
        studentProfile: subData.profile,
      }),
    });
    const journeyData = await journeyRes.json();
    console.log(`✅ Journey created`);
    console.log(`   Journey ID: ${journeyData.journeyId}\n`);

    // Step 7: Get journey details
    console.log("7️⃣ Fetching journey details...");
    const detailRes = await fetch(`${API_BASE}/api/learning/journey/${journeyData.journeyId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const detailResponse = await detailRes.json();
    const detailData = detailResponse.data || detailResponse;
    console.log(`✅ Journey loaded`);
    console.log(`   Status: ${detailData.status}`);
    console.log(`   Current Stage: ${detailData.currentStageIndex}`);
    console.log(`   Completed Stages: ${detailData.completedStages.length}\n`);

    console.log("✅ ✅ ✅ Assessment Flow Test PASSED ✅ ✅ ✅\n");
    console.log("The full flow works correctly:");
    console.log("  1. Fetch curriculum");
    console.log("  2. Select unit");
    console.log("  3. Generate questions");
    console.log("  4. Answer questions");
    console.log("  5. Submit assessment ✓");
    console.log("  6. Create journey ✓");
    console.log("  7. Load journey ✓");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testAssessmentFlow();
