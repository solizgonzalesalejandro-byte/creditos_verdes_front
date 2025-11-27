"use client";

import { useEffect, useState } from "react";

export default function AuthGate({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const check = () => {
      const logged =
        sessionStorage.getItem("login") === "true" ||
        sessionStorage.getItem("authToken");

      setIsAuthed(!!logged);
    };

    // Revisar al cargar
    check();

    // Escuchar login
    const onLogin = () => check();
    window.addEventListener("login-exitoso", onLogin);

    return () => window.removeEventListener("login-exitoso", onLogin);
  }, []);

  if (!isAuthed) return null;

  return <>{children}</>;
}
