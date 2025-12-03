"use client";
import React from "react";
import "./transacccionCss.css";

export default function Estadisticas() {
  return (
    <main className="wrap">

      <header className="topbar">
        <div>
          <h1>Panel de estadísticas</h1>
          <p className="subtitle">Resumen de vistas y métricas ambientales</p>
        </div>
        <div className="meta">
          <span className="tag">Base: Vistas SQL</span>
        </div>
      </header>

      {/* KPI cards */}
      <section className="kpis" aria-label="Indicadores principales">
        <div className="kpi" id="kpi-publicaciones">
          <div className="kpi__title">Publicaciones totales</div>
          <div className="kpi__value" id="total-publicaciones">—</div>
          <div className="kpi__meta">Suma de v_pub_semana</div>
        </div>

        <div className="kpi" id="kpi-ventas">
          <div className="kpi__title">Ventas totales</div>
          <div className="kpi__value" id="total-ventas">—</div>
          <div className="kpi__meta">v_ventas_semana (completadas)</div>
        </div>

        <div className="kpi" id="kpi-impacto">
          <div className="kpi__title">Impacto ambiental (total)</div>
          <div className="kpi__value" id="impacto-total">—</div>
          <div className="kpi__meta">CO₂ + Energía + Agua</div>
        </div>

        <div className="kpi" id="kpi-pts">
          <div className="kpi__title">Puntos ecológicos</div>
          <div className="kpi__value" id="puntos-ecologicos">—</div>
          <div className="kpi__meta">Regla: configurable</div>
        </div>
      </section>

      {/* Layout: izquierda listas, derecha tablas grandes */}
      <section className="grid">

        {/* Left column: listas cortas */}
        <aside className="col col--left">

          <div className="panel">
            <h3>Top categorías por publicaciones</h3>
            <ol className="list" id="top-categorias">
              {/* Rellenar con: cat.nombreCategoria — publicaciones — total_valor */}
              <li>Ropa — <strong>120</strong> pubs — Bs. 2,400</li>
              <li>Tecnología — <strong>80</strong> pubs — Bs. 5,600</li>
              <li>Hogar — <strong>35</strong> pubs — Bs. 980</li>
            </ol>
            <p className="small">Ordenado por publicaciones y total_valor.</p>
          </div>

          <div className="panel">
            <h3>Top 10 - Ranking de usuarios</h3>
            <ol className="list" id="ranking-usuarios">
              {/* Rellenar con v_ranking_usuarios/top10_ranking */}
              <li>ana_m — impacto: 124.34</li>
              <li>juan_p — impacto: 99.12</li>
              <li>maria_s — impacto: 83.02</li>
            </ol>
          </div>

          <div className="panel panel--small">
            <h3>Bitácora (últimos)</h3>
            <ul className="log" id="bitacora">
              <li>2025-11-24 — Usuario X modificó publicación 123</li>
              <li>2025-11-23 — Intercambio 456 completado</li>
              <li>2025-11-20 — Movimiento de crédito 789</li>
            </ul>
          </div>

        </aside>

        {/* Right column: tablas */}
        <section className="col col--right">

          <div className="panel">
            <h3>Impacto por semana</h3>
            <table className="data-table" id="tabla-impacto">
              <thead>
                <tr>
                  <th>Semana inicio</th>
                  <th>CO₂ (kg)</th>
                  <th>Energía (kWh)</th>
                  <th>Agua (L)</th>
                  <th>Impacto total</th>
                </tr>
              </thead>
              <tbody>
                {/* Rellenar desde v_impacto_semana o v_publicaciones_impacto */}
                <tr><td>2025-11-17</td><td>134.4</td><td>12.5</td><td>420.0</td><td>566.9</td></tr>
                <tr><td>2025-11-10</td><td>98.2</td><td>10.0</td><td>311.4</td><td>419.6</td></tr>
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3>Ventas por semana</h3>
            <table className="data-table" id="tabla-ventas">
              <thead>
                <tr>
                  <th>Semana inicio</th>
                  <th>Ventas</th>
                  <th>Monto liberado (Bs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>2025-11-17</td><td>24</td><td>12,450.00</td></tr>
                <tr><td>2025-11-10</td><td>17</td><td>9,230.00</td></tr>
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3>Extracto de billetera</h3>
            <table className="data-table" id="tabla-billetera">
              <thead>
                <tr>
                  <th>ID movimiento</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Descripcion</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>789</td><td>NombreUser</td><td>2025-11-24</td><td>Ingreso</td><td>120.00</td><td>Venta #456</td></tr>
                <tr><td>790</td><td>NombreUser</td><td>2025-11-22</td><td>Retiro</td><td>-30.00</td><td>Retiro caja</td></tr>
              </tbody>
            </table>
          </div>

        </section>
      </section>

      <footer className="bottom">
        <small>Generado desde vistas SQL. Conecta cada tabla con tus endpoints o templating server-side.</small>
      </footer>
    </main>
  );
}
