"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Publicacion from "./Publicacion";       
import { useEffect } from "react";
import Perfil from "./Perfil";
import Estadisticas from "./transaccion";
import CrearPublicacion from "./crea_publi";
import  VistaComprarCreditosYSuscripcion  from "./compra_puntos";

type PanelKey = "home" | "publicaciones" | "publicar" | "usuario" | "transacciones";

export default function MenuPage() {
  const router = useRouter();
  const [panel, setPanel] = useState<PanelKey>("home");
  const [usuario, setUsuario] = useState<string | null>(null);
  const [puntos,setPuntos]=useState<number>(0);
// proteger ruta
useEffect(() => {
  const isLogged = sessionStorage.getItem("login");

  if (isLogged !== "true") {
    router.replace("/login");
  }

    const storedUser = sessionStorage.getItem("usuario");
    if(storedUser==null){setUsuario("Error Papu");return;}
    const userObj = JSON.parse(storedUser);
    setUsuario(`${userObj.nombreUser}   `);
    setPuntos(100)
}, []);
  // Maneja cambiar panel (centraliza lógica: cerrar menú móvil, analytics, etc.)
  const handleShowPanel = (p: PanelKey) => {
    setPanel(p);

    // si en móvil usas checkbox hack para mostrar/ocultar menú, lo podemos desactivar aquí:
    // const cb = document.getElementById("menu-toggle") as HTMLInputElement | null;
    // if (cb && cb.checked) cb.checked = false;

    // aquí podrías agregar tracking o lazy-loading de datos por panel
    // e.g. if (p === "publicaciones") fetchProductsIfNeeded();
  };

  // Manejo de cerrar sesión
  const handleLogout = async () => {
    // opcion A: pedir confirmación
    const ok = confirm("¿Cerrar sesión?"); // puedes reemplazar por modal propio
    if (!ok) return;

    try {
      // Si guardas token/session en localStorage o cookie, eliminarlo:
      sessionStorage.clear(); // ajusta la clave a tu app
      router.push("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      // mostrar toast / mensaje si quieres
      alert("Ocurrió un error al cerrar sesión.");
    }
  };

  return (
    <>
      <input type="checkbox" id="menu-toggle" className="menu-toggle" />

      <aside className="sidebar" aria-label="Navegación lateral">
        <div className="brand">
          <label htmlFor="menu-toggle" className="hamburger" aria-label="Abrir/cerrar menú">
            ☰
          </label>
          <span className="logo">🌿 EcoSite</span>
        </div>

        <nav className="nav" role="navigation" aria-label="Menú principal">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleShowPanel("home"); }}
            className={panel === "home" ? "active" : ""}
          >
            🏠 Inicio
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleShowPanel("publicaciones"); }}
            className={panel === "publicaciones" ? "active" : ""}
          >
            👥 Publicaciones
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleShowPanel("publicar"); }}
            className={panel === "publicar" ? "active" : ""}
          >
            🧰 Publicar
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleShowPanel("usuario"); }}
            className={panel === "usuario" ? "active" : ""}
          >
            👤 Usuario
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleShowPanel("transacciones"); }}
            className={panel === "transacciones" ? "active" : ""}
          >
            🛒 Transacciones
          </a>
        </nav>

        <footer className="sidebar-footer" aria-label="Cuenta">
          <div className="user" role="group" aria-label="Información del usuario">
    <div className="avatar" aria-hidden>👩🏻‍💻</div>
    <div>
      <b>{usuario ?? "Usuario"}</b>
      <small>{puntos??"0"}</small>
    </div>
  </div>


          <button
            type="button"
            onClick={handleLogout}
            className="logout"
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </footer>
      </aside>

      {/* panel derecho: render por panel */}
      <main className="contenido" role="main" aria-live="polite">
        {panel === "home" && (
          <section>
            <VistaComprarCreditosYSuscripcion />
          </section>
        )}

        {panel === "publicaciones" && (
          <section>
            {/* Componente convertido de tu HTML de publicaciones */}
            <Publicacion />
          </section>
        )}

        {panel === "usuario" && (
          <section>
            <Perfil />
          </section>
        )}

        {panel === "transacciones" && (
          <section>
            <Estadisticas />
          </section>
        )}
        {panel === "publicar" && (
          <section>
            <CrearPublicacion />
          </section>
        )}
      </main>
    </>
  );
}
