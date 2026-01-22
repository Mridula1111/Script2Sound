import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-10 overflow-auto">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

