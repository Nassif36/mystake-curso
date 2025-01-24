// src/components/Registro.js
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import './Login.css';

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const auth = getAuth();
    const db = getFirestore();

    try {
      // Crear usuario con correo y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Guardar datos adicionales en Firestore
        setDoc(doc(db, "usuarios", user.uid), {
          nombre,
          email,
          password,
          verificado: false // Campo de verificación
        });

        setRegistroExitoso(true); // Indica que el registro fue exitoso
        navigate("/login")
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Hubo un error al registrar el usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="registro-container">
      <form className="registro-form" onSubmit={handleRegister}>
        <h1>Registro</h1>
        
        {registroExitoso && (
          <div className="checkmark-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="checkmark"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}

        {!registroExitoso && (
          <>
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
           
            <div className="login-redirect">
              <div className="contenedor-btn">
                <button type="submit" className="primary">Registrarse</button>
                <button onClick={() => navigate("/login")} className="secondary">
                  Iniciar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default Registro;
