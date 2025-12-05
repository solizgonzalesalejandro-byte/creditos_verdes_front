"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarUsuarioCompleto } from "../service"; // ajusta la ruta si hace falta
import "./creaUserCss.css";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelect, setRoleSelect] = useState("");
  const [checkedRoles, setCheckedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function toggleRole(role: string) {
    setCheckedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!fullName.trim() || !email.trim() || !password.trim() || !roleSelect) {
      setMsg({ type: "err", text: "Completa los campos obligatorios." });
      return;
    }

    setLoading(true);

    // split nombre/apellido heurístico (si no hay apellido lo dejamos vacío)
    const parts = fullName.trim().split(/\s+/);
    const nombre = parts.shift() || "";
    const apellido = parts.join(" ") || "";

    // roles: combinamos select + checkboxes si hay (removemos duplicados)
    const rolesSet = new Set<string>([roleSelect, ...checkedRoles].filter(Boolean));
    const roles = Array.from(rolesSet);

    try {
      const res = await registrarUsuarioCompleto(nombre, apellido, email.split("@")[0], password, roles);
      // Se espera respuesta con estructura { success: true, message, data: { usuario_id, billetera_id } }
      if (res?.success) {
        const data = res.data ?? res; // por si tu backend devuelve de otra forma
        // Creamos un objeto usuario para sessionStorage. Si faltan datos los inventamos tolerablemente.
        const usuario = {
          idusuario: data.usuario_id ?? data.usuarioId ?? Date.now(),
          nombre,
          apellido,
          nombreUser: email.split("@")[0],
          billetera_id: data.billetera_id ?? data.billeteraId ?? null,
        };

        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        sessionStorage.setItem("roles", JSON.stringify(roles));
        sessionStorage.setItem("login", "true");

        setMsg({ type: "ok", text: "Registro correcto. Bienvenido/a 🎉" });

        // redirigir a perfil o dashboard
        router.push("/menu");
      } else {
        const text = res?.message || "Error al registrar usuario";
        setMsg({ type: "err", text });
      }
    } catch (err: any) {
      console.error("Registro error:", err);
      setMsg({ type: "err", text: err?.message ?? "Error de red" });
    } finally {
      setLoading(false);
    }
  }

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

        <form id="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" id="fullName" name="fullName" required placeholder="Alejandro Soliz Gonzales" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" id="email" name="email" required placeholder="tu.correo@umss.edu.bo" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña (Mín. 8 caracteres)</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" id="password" name="password" required minLength={8} />
          </div>

          <div className="form-group">
            <label htmlFor="role">Selecciona tu Rol</label>
            <select value={roleSelect} onChange={(e) => setRoleSelect(e.target.value)} id="role" name="role" required>
              <option value="">-- Selecciona un rol --</option>
              <option value="usuario">Usuario Común</option>
              <option value="vendedor">Vendedor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <label>Selecciona tus Roles (adicionales opcionales)</label>
          <div className="role-options">
            <label className="role-checkbox">
              <input type="checkbox" checked={checkedRoles.includes("usuario")} onChange={() => toggleRole("usuario")} />
              <span>Usuario</span>
            </label>
            <label className="role-checkbox">
              <input type="checkbox" checked={checkedRoles.includes("vendedor")} onChange={() => toggleRole("vendedor")} />
              <span>Vendedor</span>
            </label>
            <label className="role-checkbox">
              <input type="checkbox" checked={checkedRoles.includes("administrador")} onChange={() => toggleRole("administrador")} />
              <span>Administrador</span>
            </label>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registrando..." : "REGISTRARME Y GANAR 5 Cv"}
          </button>

          {msg && (
            <div style={{ marginTop: 12, color: msg.type === "err" ? "#8a1f1f" : "#146c43" }}>
              {msg.text}
            </div>
          )}
        </form>

        <p className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a>
        </p>
      </div>
    </div>
  );

}
