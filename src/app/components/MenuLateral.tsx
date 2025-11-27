"use client";
import React from "react";
import Link from "next/link";
import styles from "./MenuLateral.module.css";

export default function MenuLateral() {
  return (
    <>
      <input id="menu-toggle" className="menu-toggle" type="checkbox" aria-hidden="true" />

      <aside className={styles.sidebar} aria-label="Navegación lateral">
        <div className={styles.brand}>
          <label htmlFor="menu-toggle" className={styles.hamburger} aria-label="Abrir/cerrar menú">☰</label>
          <span className={styles.logo}>🌿 EcoSite</span>
        </div>

        <nav className={styles.nav} role="navigation">
          <Link className={styles.link} href="#">🏠 Inicio</Link>
          <Link className={styles.link} href="#">👥 Publicaciones</Link>
          <Link className={styles.link} href="#">🧰 Publicar</Link>
          <Link className={styles.link} href="#">👤 Usuario</Link>
          <Link className={styles.link} href="#">🛒 Transacciones</Link>

          <details className={styles.submenuSummary}>
            <summary>🔧 Más</summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Link className={styles.link} href="#">Configuración</Link>
              <Link className={styles.link} href="#">Ayuda</Link>
            </div>
          </details>
        </nav>

        <footer className={styles.sidebarFooter}>
          <div className={styles.user}>
            <div className={styles.avatar}>👩🏻‍💻</div>
            <div>
              <b>Nombre</b>
              <small>Miembro</small>
            </div>
          </div>

          <a
            className={styles.logout}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Limpiar session y notificar a AuthGate
              try {
                sessionStorage.removeItem("authToken");
                sessionStorage.setItem("login", "false");
              } catch {}
              window.dispatchEvent(new CustomEvent("logout"));
              // opcional: redirigir al login
              window.location.href = "/login";
            }}
          >
            Cerrar sesión
          </a>
        </footer>
      </aside>
    </>
  );
}
