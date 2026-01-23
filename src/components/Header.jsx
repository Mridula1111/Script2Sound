export default function Header() {
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo + Title */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎙️</span>
          <h1 className="text-xl font-bold tracking-wide">
            MARS
          </h1>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            <li className="hover:text-indigo-200 cursor-pointer">Home</li>
            <li className="hover:text-indigo-200 cursor-pointer">About</li>
            <li
              className="hover:text-indigo-200 cursor-pointer"
              onClick={() =>
                window.open("https://github.com/Mridula1111/Script2Sound", "_blank")
              }
            >
              GitHub
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
}

