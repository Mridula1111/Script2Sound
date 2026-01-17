import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      navigate("/generate");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      <div className="flex justify-center items-center">
        <img
          src={logo}
          alt="Script2Sound logo"
          className="w-24 h-24 mb-1"
        />
      </div>

      {/* Top title */}
      <header className="py-6 text-center">
       <h1 className="text-5xl font-bold -mt-4 bg-linear-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent drop-shadow-md">
        Script2Sound
      </h1>

      </header>

      {/* Centered login card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-slate-800 text-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-semibold text-center mb-6">Login</h2>

           <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full mb-3 p-3 rounded bg-slate-700 text-white placeholder-slate-400"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full mb-4 p-3 rounded bg-slate-700 text-white placeholder-slate-400"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition p-3 rounded font-semibold">
            {loading ? "Logging in..." : "Login"}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
