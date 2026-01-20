import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center gap-2 font-bold text-lg">
          
          <img
            src="src\assets\logo.svg"
            alt="Script2Sound logo"
            className="w-12 h-12 object-contain"
          />
        
        {/* Left: Title */}
        <Link
          to="/generate"
          >
        <span className="bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md font-bold text-lg">
           Script2Sound
        </span>
        </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/library"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            My Library
          </Link>

          <button
            onClick={handleLogout}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}
