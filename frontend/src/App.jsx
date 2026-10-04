import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./pages/components/Navbar";
import CreateProject from "./pages/create_project";
import ProjectDetail from "./pages/ProjectDetail";
import RequireAuth from "./pages/components/RequireAuth";
import AuthProvider from "./auth/AuthProvider";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<RequireAuth><CreateProject /></RequireAuth>} />
            <Route path="/project/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
            <Route path="*" element={<p className="status-text">Page not found.</p>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
