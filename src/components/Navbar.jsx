export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo / Title */}
        <div className="text-xl font-bold tracking-wide">
          Script2Sound 🎙️
        </div>

        {/* Navigation */}
        <ul className="flex space-x-6 text-sm font-medium">
          <li className="hover:text-indigo-200 cursor-pointer">
            Home
          </li>
          <li className="hover:text-indigo-200 cursor-pointer">
            About
          </li>
          <li className="hover:text-indigo-200 cursor-pointer">
            GitHub
          </li>
        </ul>

      </div>
    </nav>
  );
}
