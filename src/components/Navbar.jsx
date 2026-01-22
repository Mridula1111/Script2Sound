import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link to="/generate" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Script2Sound logo"
            className="w-10 h-10 object-contain"
          />
          <span className="bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md font-bold text-lg">
            Script2Sound
          </span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/generate"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            isActive("/generate")
              ? "bg-slate-700 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Notes → Audio
        </Link>
        <Link
          to="/audio-to-notes"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            isActive("/audio-to-notes")
              ? "bg-slate-700 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Audio → Notes
        </Link>
        <Link
          to="/library"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            isActive("/library")
              ? "bg-slate-700 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Library
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
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
