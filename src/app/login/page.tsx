"use client";
import styles from "./page.module.css";

export default function LoginPage() {
  const handleLogin = () => {
    sessionStorage.setItem("authToken", "ok");
    sessionStorage.setItem("login", "true");
    window.dispatchEvent(new CustomEvent("login-exitoso"));
    // redirigir después de login
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Pantalla Login</h1>
        <button onClick={handleLogin}>Iniciar sesión</button>
      </div>
    </div>
  );
}
