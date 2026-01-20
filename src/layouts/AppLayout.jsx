import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />

      <main className="grow flex justify-center">
        <div className="w-full max-w-3xl px-6 py-10">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

