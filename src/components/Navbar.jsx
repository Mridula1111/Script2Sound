import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear auth (if any)
    localStorage.removeItem("token");

    // go back to login
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gray-950 px-6 py-4">
      <h1 className="text-2xl font-bold text-white">Script2Sound</h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded bg-black text-white"
      >
        Logout
      </button>
    </nav>
  );
}
