import { Routes, Route, Navigate } from "react-router-dom";
import GenerateScript from "./pages/GenerateScript";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import Questions from "./pages/Questions";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    
      <Route
        path="/generate"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GenerateScript />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/library" element={<Library />} />
      <Route path="/questions/:audioId" element={<Questions />} />

    </Routes>
    
  );
}

export default App;
