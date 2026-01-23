import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import FloatingLabel from "../components/FloatingLabel";

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Very weak", color: "text-red-400" };
  if (score <= 3) return { label: "Weak", color: "text-orange-400" };
  if (score === 4) return { label: "Good", color: "text-yellow-400" };
  return { label: "Strong", color: "text-green-400" };
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("register"); // register | verify
  const navigate = useNavigate();
  const rules = password ? getPasswordStrength(password) : {};

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert("Verification code sent to your email");
      setStep("verify");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      alert("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Logo */}
      <div className="flex justify-center items-center">
        <img
          src={logo}
          alt="MARS logo"
          className="w-24 h-24 mb-1"
        />
      </div>

      {/* Title */}
      <header className="py-6 text-center">
      <h1 className="text-4xl font-bold -mt-6 bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md">
          MARS
        </h1>
      </header>

      {/* Centered card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-slate-800 text-white p-8 rounded-xl shadow-lg w-full max-w-sm">

          <h2 className="text-xl font-semibold text-center mb-6">
            {step === "register" ? "Register" : "Verify Email"}
          </h2>

          {step === "register" && (
            <div className="space-y-4">
              <FloatingLabel label="Email" required>
                <input
                  type="email"
                  value={email}
                  className="w-full px-4 pt-6 pb-2 rounded bg-slate-700 text-white"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FloatingLabel>

              <FloatingLabel label="Password" required>
                <input
                  type="password"
                  value={password}
                  className="w-full px-4 pt-6 pb-2 rounded bg-slate-700 text-white"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FloatingLabel>

              {password && (
                <p className={`text-sm ${getPasswordStrength(password).color}`}>
                  Password strength: <span className="font-medium">
                    {getPasswordStrength(password).label}
                  </span>
                </p>
              )}

              {password && (
                <ul className="text-sm space-y-1 mt-2">
                  <li className={rules.length ? "text-green-400" : "text-slate-400"}>
                    {rules.length ? "✓" : "•"} At least 8 characters
                  </li>
                  <li className={rules.lowercase ? "text-green-400" : "text-slate-400"}>
                    {rules.lowercase ? "✓" : "•"} One lowercase letter
                  </li>
                  <li className={rules.uppercase ? "text-green-400" : "text-slate-400"}>
                    {rules.uppercase ? "✓" : "•"} One uppercase letter
                  </li>
                  <li className={rules.number ? "text-green-400" : "text-slate-400"}>
                    {rules.number ? "✓" : "•"} One number
                  </li>
                  <li className={rules.special ? "text-green-400" : "text-slate-400"}>
                    {rules.special ? "✓" : "•"} One special character
                  </li>
                </ul>
              )}

              <button
                onClick={handleRegister}
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition p-3 rounded font-semibold"
              >
                Register
              </button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <p className="text-sm text-center text-slate-300">
                Enter the 6-digit code sent to your email
              </p>

              <FloatingLabel label="Verification Code" required>
                <input
                  type="text"
                  value={code}
                  className="w-full px-4 pt-6 pb-2 rounded bg-slate-700 text-white"
                  onChange={(e) => setCode(e.target.value)}
                />
              </FloatingLabel>

              <button
                onClick={handleVerify}
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition p-3 rounded font-semibold"
              >
                Verify Email
              </button>
            </div>
          )}

          {/* Back to login */}
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
