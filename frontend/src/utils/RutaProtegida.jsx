// src/utils/RutaProtegida.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

const RutaProtegida = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/lgn" />;
  }

  return children;
};

export default RutaProtegida;
