import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const RutaProtegida = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/" />; // Redirige a la página de inicio si no está autenticado
  }

  return children; // Permite el acceso al componente si está autenticado
};

export default RutaProtegida;
