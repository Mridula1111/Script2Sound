import "dotenv/config";
import mongoose from "mongoose";
import Curriculum from "../models/Curriculum.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const curriculumData = [
  // ========== CBSE Class 11 Physics ==========
  {
    name: "CBSE Class 11 Physics",
    type: "CBSE",
    subject: "Physics",
    units: [
      {
        name: "Unit 1: Motion in a Plane",
        description: "Study of vectors and motion in 2D",
        complexity: "medium",
        subtopics: ["Vectors", "Scalar and Vector Quantities", "Position and Displacement", "Velocity and Acceleration", "Projectile Motion", "Circular Motion"],
      },
      {
        name: "Unit 2: Laws of Motion",
        description: "Newton's laws and their applications",
        complexity: "medium",
        subtopics: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Friction", "Connected Bodies", "Circular Motion Forces"],
      },
      {
        name: "Unit 3: Work Energy and Power",
        description: "Concepts of work, energy and power",
        complexity: "medium",
        subtopics: ["Work and Force", "Kinetic Energy", "Potential Energy", "Conservation of Energy", "Power", "Collisions"],
      },
      {
        name: "Unit 4: Oscillations and Waves",
        description: "Simple harmonic motion and wave properties",
        complexity: "high",
        subtopics: ["Simple Harmonic Motion", "Energy in SHM", "Waves", "Wave Equations", "Sound Waves", "Doppler Effect"],
      },
    ],
    isPreloaded: true,
  },

  // ========== CBSE Class 11 Mathematics ==========
  {
    name: "CBSE Class 11 Mathematics",
    type: "CBSE",
    subject: "Mathematics",
    units: [
      {
        name: "Unit 1: Sets and Relations",
        description: "Fundamentals of set theory",
        complexity: "low",
        subtopics: ["Sets", "Subsets", "Operations on Sets", "Relations", "Functions", "Domain and Range"],
      },
      {
        name: "Unit 2: Trigonometric Functions",
        description: "Trigonometry and its applications",
        complexity: "medium",
        subtopics: ["Angles and Radians", "Trigonometric Ratios", "Trigonometric Identities", "Inverse Trigonometric Functions", "Applications"],
      },
      {
        name: "Unit 3: Complex Numbers and Sequences",
        description: "Complex numbers, AP and GP",
        complexity: "medium",
        subtopics: ["Complex Numbers", "Algebra of Complex Numbers", "Arithmetic Progression", "Geometric Progression", "Sum of Series"],
      },
      {
        name: "Unit 4: Calculus Basics",
        description: "Introduction to calculus",
        complexity: "high",
        subtopics: ["Limits", "Continuity", "Derivatives", "Differentiation Rules", "Applications of Derivatives"],
      },
    ],
    isPreloaded: true,
  },

  // ========== Tamil Nadu Matriculation Physics ==========
  {
    name: "TN Matriculation Physics Class 12",
    type: "TN",
    subject: "Physics",
    units: [
      {
        name: "Unit 1: Electrostatics",
        description: "Electric charges and fields",
        complexity: "medium",
        subtopics: ["Electric Charge", "Coulomb's Law", "Electric Field", "Potential", "Capacitance", "Dielectrics"],
      },
      {
        name: "Unit 2: Current Electricity",
        description: "Electric current and circuits",
        complexity: "medium",
        subtopics: ["Electric Current", "Resistance", "EMF and Potential Difference", "Ohm's Law", "Circuits", "Power and Energy"],
      },
      {
        name: "Unit 3: Magnetism and Electromagnetism",
        description: "Magnetic fields and electromagnetic induction",
        complexity: "high",
        subtopics: ["Magnetic Field", "Force on Current", "Torque", "Electromagnetic Induction", "Transformers", "AC Circuits"],
      },
    ],
    isPreloaded: true,
  },

  // ========== Anna University Engineering Mathematics ==========
  {
    name: "Anna University Engineering Mathematics I",
    type: "ANNA",
    subject: "Mathematics",
    units: [
      {
        name: "Unit 1: Matrix Methods",
        description: "Linear algebra and matrix computations",
        complexity: "high",
        subtopics: ["Matrices", "Determinants", "Inverse", "Rank", "Solving Linear Systems", "Eigenvalues and Eigenvectors"],
      },
      {
        name: "Unit 2: Calculus Methods",
        description: "Differential and integral calculus",
        complexity: "high",
        subtopics: ["Functions and Limits", "Differentiation", "Partial Derivatives", "Integration", "Multiple Integrals", "Applications"],
      },
      {
        name: "Unit 3: Differential Equations",
        description: "Solving differential equations",
        complexity: "high",
        subtopics: ["First Order Equations", "Second Order Equations", "Linear Equations", "Applications", "Laplace Transform", "Series Solutions"],
      },
    ],
    isPreloaded: true,
  },

  // ========== Anna University Engineering Physics ==========
  {
    name: "Anna University Engineering Physics",
    type: "ANNA",
    subject: "Physics",
    units: [
      {
        name: "Unit 1: Optics and Photonics",
        description: "Light properties and quantum optics",
        complexity: "high",
        subtopics: ["Wave Nature of Light", "Ray Optics", "Optical Instruments", "Interference", "Diffraction", "Photonics"],
      },
      {
        name: "Unit 2: Quantum Mechanics",
        description: "Quantum theory and atomic physics",
        complexity: "high",
        subtopics: ["Quantum Models", "Schrodinger Equation", "Atomic Structure", "Band Theory", "Semiconductors", "Superconductivity"],
      },
    ],
    isPreloaded: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Check if data already exists
    const existingCount = await Curriculum.countDocuments({ isPreloaded: true });
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} preloaded curricula. Skipping seed.`);
      console.log("💡 Run 'db.curricula.deleteMany({isPreloaded: true})' to reset and reseed.");
      process.exit(0);
    }

    // Insert curriculum data
    await Curriculum.insertMany(curriculumData);
    console.log(`✅ Successfully seeded ${curriculumData.length} curricula`);

    // Verify insertion
    const count = await Curriculum.countDocuments();
    console.log(`📊 Total curricula in database: ${count}`);

    const subjects = await Curriculum.find().distinct("subject");
    console.log(`📚 Subjects available: ${subjects.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
