// src/utils/useAuth.js
import { useEffect, useState } from "react";
import * as jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tkn = localStorage.getItem("token");
    if (tkn) {
      try {
        const decoded = jwt_decode.default(tkn);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          console.warn("⏳ Token expirado");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
          navigate("/lgn");
        } else {
          setUser(decoded);
          setToken(tkn);
        }
      } catch (err) {
        console.error("❌ Token inválido", err);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        navigate("/lgn");
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, [navigate]);

  return { user, token, loading };
};

export default useAuth;
