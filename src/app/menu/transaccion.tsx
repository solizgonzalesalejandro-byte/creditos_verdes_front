"use client";
import React, { useEffect, useState } from "react";
import "./transacccionCss.css";

import {
  obtenerImpactoSemanaSP,
  obtenerRankingUsuariosSP,
  obtenerTop10RankingSP,
  obtenerVistasSP,
  getPublicaciones,
  getPlataformaIngresos,
} from "../service"; // <-- IMPORT CORRECTO

export default function Estadisticas() {
  /* =======================
        ESTADOS
  ========================== */
  const [impactoSemana, setImpactoSemana] = useState<any[]>([]);
  const [rankingUsuarios, setRankingUsuarios] = useState<any[]>([]);
  const [top10, setTop10] = useState<any[]>([]);
  const [vistas, setVistas] = useState<any[]>([]);

  /* KPIs */
  const [kpiPublicaciones, setKpiPublicaciones] = useState(0);
  const [kpiVentas, setKpiVentas] = useState(0);
  const [kpiImpactoTotal, setKpiImpactoTotal] = useState(0);
  const [kpiPuntosEco, setKpiPuntosEco] = useState(0);

  /* INGRESOS */
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [transaccionesCount, setTransaccionesCount] = useState<number>(0);
  const [topCompras, setTopCompras] = useState<any[]>([]);
  const [topTipos, setTopTipos] = useState<any[]>([]);
  const [ingresosError, setIngresosError] = useState<string | null>(null);

  /* =======================
        CARGA DE DATOS
  ========================== */
  useEffect(() => {
    (async () => {
      try {
        /* ---------------- IMPACTO SEMANA ---------------- */
        const impacto = await obtenerImpactoSemanaSP();
        const rowsImpacto = (impacto.data || []).map((r: any) => ({
          ...r,
          co2: Number(r.co2),
          energia: Number(r.energia),
          agua: Number(r.agua),
          impactoTotal: Number(r.co2) + Number(r.energia) + Number(r.agua),
        }));
        setImpactoSemana(rowsImpacto);

        /* KPI Impacto */
        setKpiImpactoTotal(rowsImpacto.reduce((acc: number, r: any) => acc + (r.impactoTotal || 0), 0));

        /* ---------------- RANKING USUARIOS ---------------- */
        const ranking = await obtenerRankingUsuariosSP();
        const rowsRanking = (ranking.data || []).map((r: any) => ({
          ...r,
          ventas: Number(r.ventas),
          bs_liberados: Number(r.bs_liberados),
        }));
        setRankingUsuarios(rowsRanking);
        setKpiVentas(rowsRanking.reduce((acc: number, r: any) => acc + (r.ventas || 0), 0));

        /* ---------------- TOP 10 RANKING ---------------- */
        const top10resp = await obtenerTop10RankingSP();
        const rowsTop10 = (top10resp.data || []).map((r: any) => ({ ...r, impactoTotal: Number(r.impactoTotal) }));
        setTop10(rowsTop10);
        setKpiPuntosEco(rowsTop10.reduce((acc: number, r: any) => acc + (r.impactoTotal || 0), 0));

        /* ---------------- VIEWS ---------------- */
        const vistasResp = await obtenerVistasSP("mydb");
        setVistas(vistasResp.data || []);

        /* ---------------- PUBLICACIONES - conteo de la semana ---------------- */
        try {
          const res = await getPublicaciones();
          const publicaciones = res.data || [];
          let publicacionesSemana = 0;
          const hoy = new Date();
          const inicioSemana = new Date(hoy);
          inicioSemana.setHours(0, 0, 0, 0);
          const day = inicioSemana.getDay();
          const diffToMonday = day === 0 ? -6 : 1 - day;
          inicioSemana.setDate(inicioSemana.getDate() + diffToMonday);
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          finSemana.setHours(23, 59, 59, 999);
          for (const pub of publicaciones) {
            if (!pub.fechaPublicacion) continue;
            const fechaPub = new Date(pub.fechaPublicacion);
            if (fechaPub >= inicioSemana && fechaPub <= finSemana) publicacionesSemana++;
          }
          setKpiPublicaciones(publicacionesSemana);
        } catch {
          setKpiPublicaciones(0);
        }

        /* ---------------- INGRESOS ---------------- */
        try {
          const resp = await getPlataformaIngresos(); // espera { success: true, data: [...] }
          const rows = Array.isArray(resp.data) ? resp.data : [];
          normalizeAndComputeIngresos(rows);
        } catch (err: any) {
          console.warn("getPlataformaIngresos falló, usando fallback", err);
          const fallback = [
            { id:1, tipo:"venta_creditos", monto:100.00, referencia_id:1, compra_id:1, detalle:"Compra de creditos id=1", fecha:"2025-11-28 23:48:50" },
            { id:2, tipo:"venta_creditos", monto:25.00, referencia_id:18, compra_id:18, detalle:"Compra de creditos id=18", fecha:"2025-12-05 14:46:10" },
            { id:3, tipo:"venta_creditos_confirmada", monto:25.00, referencia_id:null, compra_id:18, detalle:"Confirmada compra id=18", fecha:"2025-12-05 14:46:12" },
            { id:4, tipo:"venta_creditos", monto:25.00, referencia_id:19, compra_id:19, detalle:"Compra de creditos id=19", fecha:"2025-12-05 14:50:04" },
            { id:5, tipo:"venta_creditos_confirmada", monto:25.00, referencia_id:null, compra_id:19, detalle:"Confirmada compra id=19", fecha:"2025-12-05 14:50:06" },
            { id:6, tipo:"venta_creditos", monto:25.00, referencia_id:20, compra_id:20, detalle:"Compra de creditos id=20", fecha:"2025-12-05 14:50:43" },
            { id:7, tipo:"venta_creditos_confirmada", monto:25.00, referencia_id:null, compra_id:20, detalle:"Confirmada compra id=20", fecha:"2025-12-05 14:50:44" },
            { id:8, tipo:"venta_creditos", monto:25.00, referencia_id:21, compra_id:21, detalle:"Compra de creditos id=21", fecha:"2025-12-05 14:51:06" },
            { id:9, tipo:"venta_creditos_confirmada", monto:25.00, referencia_id:null, compra_id:21, detalle:"Confirmada compra id=21", fecha:"2025-12-05 14:51:08" },
            { id:10, tipo:"suscripcion", monto:49.99, referencia_id:3, compra_id:null, detalle:"Suscripcion usuario_id=3 meses=1", fecha:"2025-12-05 15:47:18" },
            { id:11, tipo:"venta_creditos", monto:25.00, referencia_id:22, compra_id:22, detalle:"Compra de creditos id=22", fecha:"2025-12-05 15:50:23" },
            { id:12, tipo:"venta_creditos_confirmada", monto:25.00, referencia_id:null, compra_id:22, detalle:"Confirmada compra id=22", fecha:"2025-12-05 15:50:24" },
            { id:13, tipo:"venta_creditos", monto:40.00, referencia_id:23, compra_id:23, detalle:"Compra de creditos id=23", fecha:"2025-12-05 15:50:30" },
            { id:14, tipo:"venta_creditos_confirmada", monto:40.00, referencia_id:null, compra_id:23, detalle:"Confirmada compra id=23", fecha:"2025-12-05 15:50:32" },
          ];
          normalizeAndComputeIngresos(fallback);
          setIngresosError("No se pudo cargar ingresos desde el backend (usando datos de ejemplo)");
        }
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      }
    })();
  }, []);

  /* ============================
     Función para normalizar y calcular métricas de ingresos
     - Excluye tipos que contienen "confirmada"
     ============================ */
  function normalizeAndComputeIngresos(rowsRaw: any[]) {
    // Normalizar
    const rows = rowsRaw.map((r) => ({
      id: Number(r.id),
      tipo: String(r.tipo),
      monto: Number(r.monto),
      referencia_id: r.referencia_id ?? null,
      compra_id: r.compra_id ?? null,
      detalle: r.detalle ?? "",
      fecha: String(r.fecha),
    }));

    // Filtrar para ignorar tipos con "confirmada"
    const filtered = rows.filter((r) => !String(r.tipo).toLowerCase().includes("confirmada"));

    setIngresos(filtered);

    // Total (solo filas filtradas)
    const total = filtered.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);
    setTotalIngresos(total);

    setTransaccionesCount(filtered.length);

    // Agrupar por compra_id (ignorar null)
    const byCompra = new Map<number, { compra_id: number; count: number; total: number; detalles: string[] }>();
    for (const r of filtered) {
      const cid = r.compra_id;
      if (cid == null) continue;
      const entry = byCompra.get(cid) ?? { compra_id: cid, count: 0, total: 0, detalles: [] };
      entry.count += 1;
      entry.total += Number(r.monto || 0);
      if (r.detalle) entry.detalles.push(r.detalle);
      byCompra.set(cid, entry);
    }
    const compraArr = Array.from(byCompra.values()).sort((a, b) => b.total - a.total || b.count - a.count);
    setTopCompras(compraArr.slice(0, 5));

    // Agrupar por tipo (solo filas filtradas)
    const byTipo = new Map<string, { tipo: string; count: number; total: number }>();
    for (const r of filtered) {
      const t = r.tipo ?? "otro";
      const e = byTipo.get(t) ?? { tipo: t, count: 0, total: 0 };
      e.count += 1;
      e.total += Number(r.monto || 0);
      byTipo.set(t, e);
    }
    const tipoArr = Array.from(byTipo.values()).sort((a, b) => b.total - a.total);
    setTopTipos(tipoArr.slice(0, 5));
  }

  /* =======================
        RENDER
  ========================== */

  return (
    <main className="wrap">
      <header className="topbar">
        <div>
          <h1>Panel de estadísticas</h1>
          <p className="subtitle">Resumen de vistas y métricas ambientales</p>
        </div>
        <div className="meta">
          <span className="tag"></span>
        </div>
      </header>

      {/* KPIs */}
      <section className="kpis" aria-label="Indicadores principales">
        <div className="kpi">
          <div className="kpi__title">Publicaciones totales</div>
          <div className="kpi__value">{kpiPublicaciones}</div>
          <div className="kpi__meta">Suma de publicaciones semana</div>
        </div>

        <div className="kpi">
          <div className="kpi__title">Ventas totales</div>
          <div className="kpi__value">{kpiVentas}</div>
          <div className="kpi__meta">ventas semana (completadas)</div>
        </div>

        <div className="kpi">
          <div className="kpi__title">Impacto ambiental (total)</div>
          <div className="kpi__value">{kpiImpactoTotal.toFixed(2)}</div>
          <div className="kpi__meta">CO₂ + Energía + Agua</div>
        </div>

        <div className="kpi">
          <div className="kpi__title">Puntos ecológicos</div>
          <div className="kpi__value">{kpiPuntosEco.toFixed(2)}</div>
          <div className="kpi__meta">Regla: configurable</div>
        </div>
      </section>

      {/* Layout */}
      <section className="grid">
        {/* LEFT SIDE */}
        <aside className="col col--left">
          <div className="panel">
            <h3>Top 10 - Ranking de usuarios</h3>
            <ol className="list">
              {top10.map((u, i) => (
                <li key={i}>
                  {u.nombre_usuario} — impacto: <strong>{u.impactoTotal.toFixed(2)}</strong>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <section className="col col--right">
          <div className="panel">
            <h3>Impacto por semana</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Semana inicio</th>
                  <th>CO₂</th>
                  <th>Energía</th>
                  <th>Agua</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {impactoSemana.map((i, idx) => (
                  <tr key={idx}>
                    <td>{String(i.semana_inicio).split("T")[0]}</td>
                    <td>{i.co2}</td>
                    <td>{i.energia}</td>
                    <td>{i.agua}</td>
                    <td>{i.impactoTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ------------------ PANEL INGRESOS INTEGRADO ------------------ */}
          <div className="panel">
            <h3>Ingresos — Plataforma</h3>

            {ingresosError ? <div style={{ color: "orange", fontSize: 12, marginBottom: 6 }}>{ingresosError}</div> : null}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Total ingresado</div>
              <div style={{ fontWeight: 700 }}>Bs {totalIngresos.toFixed(2)}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Transacciones</div>
              <div>{transaccionesCount}</div>
            </div>

            <div style={{ borderTop: "1px solid #eef2e9", paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Top compras (por id)</div>
              {topCompras.length === 0 ? <div className="muted">—</div> : topCompras.map((c: any) => (
                <div key={c.compra_id} style={{ fontSize: 12, marginBottom: 6 }}>
                  Compra #{c.compra_id} — veces: <strong>{c.count}</strong> — total: Bs {c.total.toFixed(2)}
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #eef2e9", paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Top tipos</div>
              {topTipos.length === 0 ? <div className="muted">—</div> : topTipos.map((t: any) => (
                <div key={t.tipo} style={{ fontSize: 12, marginBottom: 6 }}>
                  {t.tipo} — {t.count} tx — Bs {t.total.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

        </section>
      </section>

      <footer className="bottom">
        <small>Generado desde vistas SQL usando fetch.</small>
      </footer>
    </main>
  );
}
