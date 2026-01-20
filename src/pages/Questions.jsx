import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateQuestions } from "../services/api";
import Navbar from "../components/Navbar";

export default function Questions() {
  const { audioId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuestions(audioId)
      .then((res) => setQuestions(res.questions))
      .finally(() => setLoading(false));
  }, [audioId]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-white flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">
          Sample Questions
        </h1>

        {loading && <p className="text-gray-400">Generating questions...</p>}

        <div className="space-y-6">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-slate-800 p-6 rounded-xl space-y-2"
            >
              <p className="font-semibold text-white">
                Q{i + 1}. {q.question}
              </p>
              <p className="text-gray-300">
                <span className="text-indigo-400">Answer:</span>{" "}
                {q.answer}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}