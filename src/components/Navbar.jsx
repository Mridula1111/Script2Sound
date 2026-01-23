import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserEmail } from "../services/api";

function UserEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    getUserEmail()
      .then((userData) => {
        setEmail(userData.email || "");
      })
      .catch(() => {
        setEmail("");
      });
  }, []);

  return email ? <span className="text-slate-300">{email}</span> : null;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-gradient-accent border-r border-slate-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 bg-gradient-dark-vertical">
        <Link to="/generate" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="MARS logo"
            className="w-10 h-10 object-contain"
          />
        <span className="bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md font-bold text-lg">
           MARS
        </span>
        </Link>
        </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/generate"
          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive("/generate")
              ? "bg-indigo-600 text-white font-semibold shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Notes → Audio
        </Link>
        <Link
          to="/audio-to-notes"
          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive("/audio-to-notes")
              ? "bg-indigo-600 text-white font-semibold shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Audio → Notes
        </Link>
          <Link
            to="/library"
          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive("/library")
              ? "bg-indigo-600 text-white font-semibold shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Library
        </Link>
        <Link
          to="/planner"
          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive("/planner") || isActive("/courses") || isActive("/tasks") || isActive("/study-session")
              ? "bg-indigo-600 text-white font-semibold shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Planner
          </Link>
        <Link
          to="/learning-assistant"
          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive("/learning-assistant")
              ? "bg-indigo-600 text-white font-semibold shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Learning Assistant
        </Link>
      </nav>

      {/* User Email Display */}
      <div className="p-4 border-t border-slate-800 bg-gradient-dark-vertical">
        <div className="text-xs text-slate-400 px-2 py-1 mb-2">
          <UserEmail />
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800 bg-gradient-dark-vertical">
          <button
            onClick={handleLogout}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
    </aside>
  );
}
