"use client";
import React from "react";
import "./perfilCss.css";

export default function Perfil() {
  return (
    <div className="wrap">

      {/* CABECERA / INFO USUARIO */}
      <header className="header">
        <div className="user">
          <div className="avatar">👤</div>
          <div className="u-meta">
            <h1 className="u-name">
              Carlos Mamani <span className="u-handle">@cmamani2025</span>
            </h1>
            <div className="u-sub">Vendedor · Tecnología</div>
          </div>
        </div>

        <div className="account-info">
          <div className="card small">
            <div className="card-title">Créditos verdes</div>
            <div className="card-big" id="creditos">340.75</div>
            <div className="card-note">kWh / equivalentes</div>
          </div>

          <div className="card small">
            <div className="card-title">Saldo (Bs.)</div>
            <div className="card-big" id="saldo">123.50</div>
            <div className="card-note">Última recarga: 2025-11-25</div>
          </div>

          <div className="card small">
            <div className="card-title">Actividad</div>
            <div className="card-big" id="actividad">Publicó • Compró</div>
            <div className="card-note">Último: 2025-11-25 12:20</div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">

        {/* IZQUIERDA: Impacto ambiental */}
        <section className="panel impacto">
          <h2>Impacto ambiental (composición)</h2>

          <div className="impacto-resumen">
            <div className="impacto-total">
              <div className="label">Impacto total (estimado)</div>
              <div className="big">340.75</div>
              <div className="small muted">
                unidad agregada: suma CO₂ + Energía + Agua
              </div>
            </div>

            <div className="impacto-bars">
              <div className="bar-row">
                <div className="bar-label">CO₂</div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: "25%" }}></div>
                </div>
                <div className="bar-value">35.75</div>
              </div>

              <div className="bar-row">
                <div className="bar-label">Energía</div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: "62%" }}></div>
                </div>
                <div className="bar-value">250.00</div>
              </div>

              <div className="bar-row">
                <div className="bar-label">Agua</div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: "13%" }}></div>
                </div>
                <div className="bar-value">55.00</div>
              </div>

              <div className="legend">
                <span className="dot co2"></span> CO₂
                <span className="dot ene"></span> Energía
                <span className="dot agua"></span> Agua
              </div>
            </div>
          </div>
        </section>

        {/* DERECHA: Publicaciones */}
        <section className="panel publicaciones">
          <div className="panel-head">
            <h2>Publicaciones</h2>
            <div className="stats-inline">
              <div className="pill">Publicadas <strong>3</strong></div>
              <div className="pill">Pendientes <strong>1</strong></div>
              <div className="pill">Completadas <strong>1</strong></div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="pub-table">
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
                <tr>
                  <td>celular galaxy one</td>
                  <td><span className="badge activo">activa</span></td>
                  <td>1200.00</td>
                  <td>2</td>
                  <td>340.00</td>
                  <td>2025-11-04</td>
                </tr>

                <tr>
                  <td>Paquete solar</td>
                  <td><span className="badge reservado">pendiente</span></td>
                  <td>800.00</td>
                  <td>1</td>
                  <td>200.00</td>
                  <td>2025-09-03</td>
                </tr>

                <tr>
                  <td>Cargador multi Uso</td>
                  <td><span className="badge completado">completado</span></td>
                  <td>45.00</td>
                  <td>1</td>
                  <td>5.20</td>
                  <td>2025-10-12</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button className="btn">Ver todas</button>
            <button className="btn ghost">Exportar</button>
          </div>
        </section>

        {/* PIE: resumen */}
        <section className="panel resumen">
          <h2>Resumen rápido</h2>
          <ul className="resumen-list">
            <li><strong>Créditos verdes:</strong> <span id="res-creditos">340.75</span></li>
            <li><strong>Billetera (saldo):</strong> <span id="res-saldo">123.50 Bs.</span></li>
            <li><strong>Publicaciones activas:</strong> <span>2</span></li>
            <li><strong>Intercambios pendientes:</strong> <span>1</span></li>
          </ul>
        </section>

      </main>
    </div>
  );
}
