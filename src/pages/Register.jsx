import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("register"); // register | verify
  const navigate = useNavigate();

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

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

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

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      alert("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <>
      <div className="max-w-sm mx-auto mt-20 space-y-4">
        <h1 className="text-xl font-bold text-center">
          {step === "register" ? "Register" : "Verify Email"}
        </h1>

        {step === "register" && (
          <>
            <input
              placeholder="Email"
              className="w-full border p-2 rounded"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Register
            </button>
          </>
        )}

        {step === "verify" && (
          <>
            <p className="text-sm text-center text-gray-600">
              Enter the 6-digit code sent to your email
            </p>

            <input
              placeholder="Verification Code"
              className="w-full border p-2 rounded"
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={handleVerify}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              Verify Email
            </button>
          </>
        )}
      </div>
    </>
  );
}
