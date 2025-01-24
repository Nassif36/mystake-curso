// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cursos from "./components/Cursos";
import Curso from "./components/Curso";
import RutaProtegida from "./components/RutaProtegida";

import Login from "./components/Login";
import Registro from "./components/Registro"; // Asegúrate de crear este componente
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/biblioteca" /> : <Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/biblioteca" element={<RutaProtegida><Cursos /></RutaProtegida>} />
        <Route path="/curso/:cursoId" element={<RutaProtegida><Curso /></RutaProtegida>} />
      </Routes>
    </Router>
  );
}

export default App;
