"use client";
import React, { useEffect, useState } from "react";
import "./perfilCss.css";
import { getPerfilConsolidado } from "../service"; // ajusta la ruta si hace falta

type Publicacion = {
  idpublicacion: number;
  titulo: string;
  descripcion?: string;
  valorCredito?: number;
  fechaPublicacion?: string;
  estadoPublica?: string;
  impactoTotal?: number;
  impactoCO2?: number;
  impactoEnergia?: number;
  impactoAgua?: number;
  foto?: string | null;
};

type Intercambio = {
  idintercambio: number;
  comprador?: string;
  vendedor?: string;
  publicacion?: string;
  estadoIntercam?: string;
  cantidad?: number;
  creditoVerde?: number;
  fechaCreacion?: string;
  fechaFinal?: string | null;
};

type Movimiento = {
  idmovimiento_credito: number;
  tipoMovimiento: string;
  monto: number;
  descripcionMovi?: string;
  fechaMovimiento?: string;
};

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [usuarioDisplay, setUsuarioDisplay] = useState({
    idusuario: 0,
    nombre_completo: "—",
    nombreUser: "—",
    saldo_billetera: 0,
  });

  const [impacto, setImpacto] = useState({
    CO2: 0,
    Energia: 0,
    Agua: 0,
    impactoTotal: 0,
  });

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [intercambiosPendientes, setIntercambiosPendientes] = useState<Intercambio[]>([]);
  const [comprasCompletadas, setComprasCompletadas] = useState<Intercambio[]>([]);
  const [extracto, setExtracto] = useState<Movimiento[]>([]);
  const [ultimoAcceso, setUltimoAcceso] = useState<any>(null);

  useEffect(() => {
    async function loadPerfil() {
      setLoading(true);
      setError(null);

      try {
        const raw = sessionStorage.getItem("usuario");
        if (!raw) {
          setError("No se encontró sesión de usuario. Inicia sesión.");
          setLoading(false);
          return;
        }
        const user = JSON.parse(raw);
        const idusuario = Number(user?.idusuario ?? user?.id ?? 0);
        if (!idusuario) {
          setError("ID de usuario inválido en sessionStorage.");
          setLoading(false);
          return;
        }

        // Llamada al endpoint que implementaste en backend
        const res = await getPerfilConsolidado(idusuario);
        // espera { success: true, data: { ... } } o datos directos según tu backend
        const data = res?.data ?? res;

        if (!res || (res.success === false && !data)) {
          setError(res?.message || "Error al obtener perfil");
          setLoading(false);
          return;
        }

        // usuario (puede venir con nombre_completo y saldo_billetera)
        const u = data.usuario ?? {};
        setUsuarioDisplay({
  idusuario: u.idusuario ?? idusuario,
  nombre_completo:
    u.nombre_completo
    || `${(u.nombre || "").trim()} ${(u.apellido || "").trim()}`.trim()
    || u.nombreUser
    || "Usuario",
  nombreUser: u.nombreUser ?? user?.nombreUser ?? "user",
  saldo_billetera: Number(u.saldo_billetera ?? 0),
});


        // impacto
        const imp = data.impacto ?? { CO2: 0, Energia: 0, Agua: 0, impactoTotal: 0 };
        setImpacto({
          CO2: Number(imp.CO2 ?? 0),
          Energia: Number(imp.Energia ?? 0),
          Agua: Number(imp.Agua ?? 0),
          impactoTotal: Number(imp.impactoTotal ?? ((imp.CO2 ?? 0) + (imp.Energia ?? 0) + (imp.Agua ?? 0))),
        });

        // publicaciones
        setPublicaciones((data.publicaciones ?? []) as Publicacion[]);

        // intercambios
        setIntercambiosPendientes((data.intercambiosPendientes ?? []) as Intercambio[]);
        setComprasCompletadas((data.comprasCompletadas ?? []) as Intercambio[]);

        // extracto
        setExtracto((data.extracto ?? []) as Movimiento[]);

        // ultimo acceso
        setUltimoAcceso(data.ultimoAcceso ?? null);

        setLoading(false);
      } catch (err: any) {
        console.error("Perfil error:", err);
        setError(err?.message ?? "Error desconocido al cargar perfil");
        setLoading(false);
      }
    }

    loadPerfil();
  }, []);

  // helpers
  const fmtNumber = (n: number, digits = 2) => Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  const { CO2, Energia, Agua, impactoTotal } = impacto;
  const co2Pct = pct(CO2, impactoTotal);
  const enePct = pct(Energia, impactoTotal);
  const aguaPct = pct(Agua, impactoTotal);

  return (
    <div className="wrap">
      {loading ? (
        <div className="loader">Cargando perfil...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {/* CABECERA / INFO USUARIO */}
          <header className="header">
            <div className="user">
              <div className="avatar" aria-hidden>👤</div>
              <div className="u-meta">
                <h1 className="u-name">
                  {usuarioDisplay.nombre_completo} <span className="u-handle">@{usuarioDisplay.nombreUser}</span>
                </h1>
                <div className="u-sub">Vendedor · Tecnología</div>
              </div>
            </div>

            <div className="account-info">
              <div className="card small" title="Impacto total (créditos verdes)">
                <div className="card-title">Créditos verdes</div>
                <div className="card-big" id="creditos">{fmtNumber(impactoTotal, 2)}</div>
                <div className="card-note">kWh / equivalentes</div>
              </div>

              <div className="card small" title="Saldo disponible">
                <div className="card-title">Saldo (Bs.)</div>
                <div className="card-big" id="saldo">{fmtNumber(usuarioDisplay.saldo_billetera, 2)}</div>
                <div className="card-note">Última recarga: —</div>
              </div>

              <div className="card small" title="Actividad resumida">
                <div className="card-title">Actividad</div>
                <div className="card-big" id="actividad">
                  Publicó • Compró
                </div>
                <div className="card-note">Último: {ultimoAcceso ? new Date(ultimoAcceso.fecha).toLocaleString() : "—"}</div>
              </div>
            </div>
          </header>

          {/* MAIN */}
          <main className="main">
            {/* IZQUIERDA: Impacto ambiental */}
            <section className="panel impacto" aria-labelledby="impactoTitle">
              <h2 id="impactoTitle">Impacto ambiental (composición)</h2>

              <div className="impacto-resumen">
                <div className="impacto-total">
                  <div className="label">Impacto total (estimado)</div>
                  <div className="big">{fmtNumber(impactoTotal, 2)}</div>
                  <div className="small muted">unidad agregada: suma CO₂ + Energía + Agua</div>
                </div>

                <div className="impacto-bars" aria-hidden={impactoTotal === 0}>
                  <div className="bar-row">
                    <div className="bar-label">CO₂</div>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: `${co2Pct}%` }} />
                    </div>
                    <div className="bar-value">{fmtNumber(CO2, 2)} ({co2Pct}%)</div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-label">Energía</div>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: `${enePct}%` }} />
                    </div>
                    <div className="bar-value">{fmtNumber(Energia, 2)} ({enePct}%)</div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-label">Agua</div>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: `${aguaPct}%` }} />
                    </div>
                    <div className="bar-value">{fmtNumber(Agua, 2)} ({aguaPct}%)</div>
                  </div>

                  <div className="legend">
                    <span className="dot co2" /> CO₂
                    <span className="dot ene" /> Energía
                    <span className="dot agua" /> Agua
                  </div>
                </div>
              </div>
            </section>

            {/* DERECHA: Publicaciones */}
            <section className="panel publicaciones" aria-labelledby="pubTitle">
              <div className="panel-head">
                <h2 id="pubTitle">Publicaciones</h2>
                <div className="stats-inline">
                  <div className="pill">Publicadas <strong>{publicaciones.length}</strong></div>
                  <div className="pill">Pendientes <strong>{intercambiosPendientes.length}</strong></div>
                  <div className="pill">Completadas <strong>{comprasCompletadas.length}</strong></div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="pub-table" role="table" aria-label="Mis publicaciones">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Valor (Bs.)</th>
                      <th>Cantidad</th>
                      <th>Impacto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {publicaciones.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", opacity: 0.8 }}>No hay publicaciones</td>
                      </tr>
                    ) : (
                      publicaciones.map((p) => (
                        <tr key={p.idpublicacion}>
                          <td>{p.titulo}</td>
                          <td>
                            <span className={`badge ${p.estadoPublica === "activa" ? "activo" : p.estadoPublica === "reservada" ? "reservado" : "completado"}`}>
                              {p.estadoPublica ?? "—"}
                            </span>
                          </td>
                          <td>{fmtNumber(Number(p.valorCredito ?? 0), 2)}</td>
                          <td>{/* si tienes cantidad en la vista, muéstrala */}</td>
                          <td>{fmtNumber(Number(p.impactoTotal ?? 0), 2)}</td>
                          <td>{p.fechaPublicacion ? new Date(p.fechaPublicacion).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button className="btn">Ver todas</button>
                <button className="btn ghost">Exportar</button>
              </div>
            </section>

            {/* PIE: resumen */}
            <section className="panel resumen" aria-labelledby="resTitle">
              <h2 id="resTitle">Resumen rápido</h2>
              <ul className="resumen-list">
                <li><strong>Créditos verdes:</strong> <span id="res-creditos">{fmtNumber(impactoTotal, 2)}</span></li>
                <li><strong>Billetera (saldo):</strong> <span id="res-saldo">{fmtNumber(usuarioDisplay.saldo_billetera, 2)} Bs.</span></li>
                <li><strong>Publicaciones activas:</strong> <span>{publicaciones.filter(p => p.estadoPublica === "activa").length}</span></li>
                <li><strong>Intercambios pendientes:</strong> <span>{intercambiosPendientes.length}</span></li>
              </ul>

              <div style={{ marginTop: 12 }}>
                <h3>Últimos movimientos</h3>
                <ul style={{ maxHeight: 140, overflowY: "auto", paddingLeft: 18 }}>
                  {extracto.length === 0 ? <li style={{ opacity: 0.8 }}>Sin movimientos recientes</li> :
                    extracto.slice(0, 8).map(m => (
                      <li key={m.idmovimiento_credito}>
                        {new Date(m.fechaMovimiento ?? "").toLocaleString()} — {m.tipoMovimiento} — {fmtNumber(Number(m.monto ?? 0), 2)} Bs. {m.descripcionMovi ? `(${m.descripcionMovi})` : ""}
                      </li>
                    ))
                  }
                </ul>
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}
