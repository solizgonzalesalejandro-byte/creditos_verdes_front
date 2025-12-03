// src/app/registro/page.tsx
"use client";

import React from "react";

export default function RegisterPage() {
  return (
    <div className="registration-container">
      <div className="intro-panel">
        <h1>Unete a TEAM-SYS</h1>
        <p><strong>Plataforma de Trueque Sostenible</strong></p>
        <p><b>Regístrate y recibe 5 Créditos Verdes (Cv)</b> de bienvenida para comenzar a intercambiar y contribuir a la Economía Circular. ♻️</p>
        <p className="incentive">¡Tu registro ayuda a reducir el CO2!</p>
      </div>

      <div className="form-panel">
        <h2>Crear Cuenta</h2>

        <form id="registration-form" onSubmit={(e) => { e.preventDefault(); /* aquí tu lógica */ }}>
          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo</label>
            <input type="text" id="fullName" name="fullName" required placeholder="Alejandro Soliz Gonzales" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required placeholder="tu.correo@umss.edu.bo" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña (Mín. 8 caracteres)</label>
            <input type="password" id="password" name="password" required />
          </div>

          <div className="form-group">
            <label htmlFor="role">Selecciona tu Rol</label>
            <select id="role" name="role" required>
              <option value="">-- Selecciona un rol --</option>
              <option value="user">Usuario Común</option>
              <option value="entrepreneur">Emprendedor</option>
            </select>
          </div>

          <label>Selecciona tus Roles</label>
          <div className="role-options">
            <label className="role-checkbox">
              <input type="checkbox" name="roles" value="usuario" />
              <span>Usuario</span>
            </label>
            <label className="role-checkbox">
              <input type="checkbox" name="roles" value="vendedor" />
              <span>Vendedor</span>
            </label>
            <label className="role-checkbox">
              <input type="checkbox" name="roles" value="administrador" />
              <span>Administrador</span>
            </label>
          </div>

          <button type="submit" className="register-btn">REGISTRARME Y GANAR 5 Cv</button>
        </form>

        <p className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a>
        </p>
      </div>
    </div>
  );
}
