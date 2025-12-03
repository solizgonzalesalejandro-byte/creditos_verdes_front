"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import {login} from '../service';

export default function LoginPage() {
  const router = useRouter();

  // Estados:
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState("");

  // handler para checkboxes
  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Handler principal del login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user.trim() || !password.trim()) {
      setError("Debes ingresar usuario y contraseña.");
      return;
    }

    if (roles.length === 0) {
      setError("Debes seleccionar al menos un rol.");
      return;
    }

    
    const data = await login(user, password, roles);

    if (!data.success) {
      setError(data.message || "Error al iniciar sesión");
      return;
    }

    sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
    sessionStorage.setItem("roles", JSON.stringify(data.roles));
    sessionStorage.setItem("login", "true");
    // Como aún no tienes backend, simulamos éxito:
    console.log("Datos enviados:", { user, password, roles });

    // Redirección al menú
    router.push("/menu");
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <title>Inicio Sesión - Login</title>
      </Head>

      <div className="login-root">
        <div className="container">
          <div className="image-side" />

          <div className="form-side">
            <div className="logo">
              <i className="fa-regular fa-circle-user" aria-hidden />
              <h1>Inicio Sesión</h1>
              <h2>Login</h2>
            </div>

            {/* FORMULARIO CON HANDLELOGIN */}
            <form onSubmit={handleLogin}>
              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
              )}

              <div className="form-group">
                <label htmlFor="user">Nombre Usuario</label>
                <input
                  type="text"
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Ingrese su usuario"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                />
              </div>

              <div className="form-group">
                <label>Selecciona tus Roles</label>

                <div className="role-options">
                  <label className="role-checkbox">
                    <input
                      type="checkbox"
                      checked={roles.includes("usuario")}
                      onChange={() => toggleRole("usuario")}
                    />
                    <span>Usuario</span>
                  </label>

                  <label className="role-checkbox">
                    <input
                      type="checkbox"
                      checked={roles.includes("vendedor")}
                      onChange={() => toggleRole("vendedor")}
                    />
                    <span>Vendedor</span>
                  </label>

                  <label className="role-checkbox">
                    <input
                      type="checkbox"
                      checked={roles.includes("administrador")}
                      onChange={() => toggleRole("administrador")}
                    />
                    <span>Administrador</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="loginboton">
                Iniciar Sesión
              </button>
            </form>

            <a href="/registro">
              <button type="button" className="CreaUser">
                Crear Usuario
              </button>
            </a>

            <div className="mensaje">
              Página autosustentable en beneficio del medio ambiente.
            </div>
          </div>
        </div>
      </div>

      {/* (CSS NO LO MUEVO) */}
      <style jsx>{`
        /* reset local al componente */ .login-root * { box-sizing: border-box; font-family: sans-serif; } .login-root { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 24px; background-color: transparent; } .container { display: flex; width: 90%; max-width: 900px; background-color: rgb(208, 224, 193); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); overflow: hidden; } .image-side { flex: 1; background: url("/image/nature_13640986.png") center/cover no-repeat; min-height: 400px; } .form-side { flex: 1; padding: 40px 30px; background-color: rgba(247, 240, 240, 0.9); display: flex; flex-direction: column; justify-content: center; } .logo { text-align: center; margin-bottom: 25px; } .logo i, .logo .fa-regular { font-size: 60px; color: #0e4561; } .logo h1 { color: #333; font-size: 28px; font-weight: bold; } .logo h2 { color: #666; font-size: 18px; font-weight: normal; } .form-group { margin-bottom: 20px; } .form-group label { display: block; margin-bottom: 8px; color: #333; font-size: 14px; font-weight: bold; } .form-group input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; background-color: #fff; } .loginboton, .CreaUser { width: 100%; padding: 12px; background-color: #0e6120; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px; transition: background-color 0.3s; } .loginboton:hover, .CreaUser:hover { background-color: #064e33; } .mensaje { text-align: center; color: #333; font-size: 13px; margin-top: 10px; } .role-options { display: flex; flex-direction: column; gap: 10px; padding: 10px 0; } .role-checkbox { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #333; background-color: #f0f0f0; padding: 8px 12px; border-radius: 6px; transition: background-color 0.3s; cursor: pointer; } .role-checkbox:hover { background-color: #dbe6d0; } .role-checkbox input[type="checkbox"] { accent-color: #0e6120; width: 18px; height: 18px; } @media (max-width: 768px) { .container { flex-direction: column; } .image-side { height: 200px; } }
      `}</style>
    </>
  );
}
