import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import GenerateScript from "./pages/GenerateScript";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

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
    </Routes>
  );
}

export default App;
