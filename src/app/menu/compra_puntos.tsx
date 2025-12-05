import React, { useEffect, useState } from "react";
import "./comprar_puntosCss.css"; // importa el CSS (ruta relativa según tu proyecto)


/* ----- Tipos ----- */
type Tabla = {
  factorCO2?: number;
  factorEnergiaKwh?: number;
  factorAguaLitro?: number;
};

type Categoria = {
  cantidadUnidad?: number;
  tabla?: Tabla;
};

type Publicacion = {
  idpublicacion: number;
  titulo: string;
  descripcion: string;
  valorCredito: number;
  categorias?: Categoria[];
};

type Wallet = {
  saldoActual: number;
};

type Usuario = {
  nombreUser: string;
  suscripcionActiva: boolean;
};

/* ----- Component ----- */
export default function VistaComprarCreditosYSuscripcion(): JSX.Element {
  // datos demo
  const [publicaciones] = useState<Publicacion[]>([
    {
      idpublicacion: 1,
      titulo: "Reciclaje de plástico — 10kg",
      descripcion: "Recolección y reciclaje de 10kg de plástico PET.",
      valorCredito: 25.0,
      categorias: [{ cantidadUnidad: 10, tabla: { factorCO2: 0.2, factorEnergiaKwh: 0.1 } }],
    },
    {
      idpublicacion: 2,
      titulo: "Paneles solares — 5kWh",
      descripcion: "Venta de energía solar equivalente a 5kWh.",
      valorCredito: 40.0,
      categorias: [{ cantidadUnidad: 5, tabla: { factorCO2: 0, factorEnergiaKwh: 0.5 } }],
    },
    {
      idpublicacion: 3,
      titulo: "Compostaje comunitario — 20kg",
      descripcion: "Transformación de residuos orgánicos en compost (20kg).",
      valorCredito: 30.0,
      categorias: [{ cantidadUnidad: 20, tabla: { factorCO2: 0.1, factorEnergiaKwh: 0.05 } }],
    },
  ]);

  const [wallet, setWallet] = useState<Wallet>({ saldoActual: 200.0 });
  const [usuario, setUsuario] = useState<Usuario>({ nombreUser: "demo_user", suscripcionActiva: false });

  // Para desactivar el botón de compra mientras procesa
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    // aquí podrías cargar publicaciones, wallet y usuario desde tu API en producción
  }, []);

  function calcularImpacto(pub: Publicacion) {
    let co2 = 0;
    let en = 0;
    let ag = 0;
    if (!pub.categorias) return { total: 0 };
    for (const c of pub.categorias) {
      const u = Number(c.cantidadUnidad ?? 0);
      co2 += u * (Number(c.tabla?.factorCO2 ?? 0));
      en += u * (Number(c.tabla?.factorEnergiaKwh ?? 0));
      ag += u * (Number(c.tabla?.factorAguaLitro ?? 0));
    }
    return { total: co2 + en + ag };
  }

  function publicacionesOrdenadas(): Publicacion[] {
    if (!usuario.suscripcionActiva) return publicaciones;
    const preferidas = publicaciones.filter((p) => p.idpublicacion % 2 === 1);
    const resto = publicaciones.filter((p) => p.idpublicacion % 2 === 0);
    return [...preferidas, ...resto];
  }

  async function iniciarCompraMarketplace(pub: Publicacion) {
    setProcessingId(pub.idpublicacion);
    try {
      const base = Number(pub.valorCredito ?? 0);
      const descuento = usuario.suscripcionActiva ? 0.1 : 0;
      const montoFinal = Number((base * (1 - descuento)).toFixed(2));

      // En producción:
      // const resp = await fetch('/api/marketplace/checkout', { method: 'POST', body: JSON.stringify({ publicacionId: pub.idpublicacion, monto: montoFinal }) });
      // const { checkoutUrl } = await resp.json();
      // window.location.href = checkoutUrl;

      // Demo: simulación de checkout -> abrir ventana y confirmar (webhook simulado)
      const fakeUrl = `https://makedpace.example.com/checkout?pub=${pub.idpublicacion}&m=${montoFinal}`;
      const w = window.open(fakeUrl, "_blank", "noopener,noreferrer");

      // Simular confirmación / webhook del marketplace
      setTimeout(() => {
        setWallet((wlt) => ({ ...wlt, saldoActual: Number((wlt.saldoActual + montoFinal).toFixed(2)) }));
        setProcessingId(null);
        try {
          if (w && !w.closed) w.close();
        } catch {
          /* ignore */
        }
        // notificación simple
        alert(`Compra exitosa (demo). Monto: Bs ${montoFinal}`);
      }, 1400);
    } catch (err) {
      console.error(err);
      setProcessingId(null);
      alert("Error iniciando compra");
    }
  }

  function abrirModalSuscripcion() {
    // en React controlaremos modal con estado
    const backdrop = document.getElementById("modalBackdrop");
    backdrop?.classList.remove("hidden");
  }

  function cerrarModalSuscripcion() {
    const backdrop = document.getElementById("modalBackdrop");
    backdrop?.classList.add("hidden");
  }

  async function confirmarSuscripcion() {
    // bloqueo simple del botón:
    const btn = document.getElementById("confirmSub") as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Procesando...";
    }

    // En producción: POST /api/suscripcion (usuario.id)
    setTimeout(() => {
      setUsuario((u) => ({ ...u, suscripcionActiva: true }));
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Comprar suscripción";
      }
      cerrarModalSuscripcion();
      alert("Suscripción activada. Ahora tienes preferencia y 10% de descuento.");
    }, 900);
  }

  // Actualizar DOM local para modal (porque en la plantilla original usamos botones con ids)
  useEffect(() => {
    const openBtn = document.getElementById("openSubModal");
    const closeBtn = document.getElementById("closeModal");
    const confirmBtn = document.getElementById("confirmSub");

    const openHandler = () => abrirModalSuscripcion();
    const closeHandler = () => cerrarModalSuscripcion();
    const confirmHandler = () => void confirmarSuscripcion();

    openBtn?.addEventListener("click", openHandler);
    closeBtn?.addEventListener("click", closeHandler);
    confirmBtn?.addEventListener("click", confirmHandler);

    // limpiar
    return () => {
      openBtn?.removeEventListener("click", openHandler);
      closeBtn?.removeEventListener("click", closeHandler);
      confirmBtn?.removeEventListener("click", confirmHandler);
    };
  }, []);

  // Cuando cambia wallet/usuario actualizamos algunos elementos que eran estáticos en el HTML original
  useEffect(() => {
    const walletEl = document.getElementById("walletAmount");
    const userNameEl = document.getElementById("userName");
    const userBadgeEl = document.getElementById("userBadge");
    if (walletEl) walletEl.textContent = `Bs ${wallet.saldoActual.toFixed(2)}`;
    if (userNameEl) userNameEl.textContent = usuario.nombreUser;
    if (userBadgeEl) userBadgeEl.textContent = usuario.suscripcionActiva ? "Preferente" : "Sin suscripción";
  }, [wallet, usuario]);

  return (
    <div className="wrapper">
      <header className="header">
        <div>
          <h1 className="title">Marketplace — Créditos Verdes y Suscripción</h1>
          <div className="subtitle">Compra créditos verdes y adquiere una suscripción que te da preferencia.</div>
        </div>

        <div className="userArea">
          <div className="userCard">
            <div className="small">Usuario</div>
            <div id="userName" className="userName">{usuario.nombreUser}</div>
            <div id="userBadge" className="badge">{usuario.suscripcionActiva ? "Preferente" : "Sin suscripción"}</div>
          </div>

          <div className="walletCard">
            <div className="small">Billetera</div>
            <div id="walletAmount" className="walletAmount">Bs {wallet.saldoActual.toFixed(2)}</div>
          </div>

          <button id="openSubModal" className="subButton">Comprar suscripción</button>
        </div>
      </header>

      <main>
        <section className="gridMain">
          <aside className="aside">
            <h3 className="h3">Filtros / Preferencias</h3>
            <p className="text">Si estás suscrito verás publicaciones preferentes al inicio y descuento aplicado.</p>
            <div className="benefits">
              <div className="benefitTitle"><strong>Beneficios suscripción</strong></div>
              <ul>
                <li>Prioridad en listados</li>
                <li>10% de descuento en compras</li>
                <li>Acceso a ofertas exclusivas</li>
              </ul>
            </div>
          </aside>

          <div className="content">
            {publicacionesOrdenadas().map((p) => {
              const imp = calcularImpacto(p);
              const descuento = usuario.suscripcionActiva ? 0.1 : 0;
              const precio = Number((p.valorCredito * (1 - descuento)).toFixed(2));
              const isPreferente = usuario.suscripcionActiva && p.idpublicacion % 2 === 1;

              return (
                <article className="card" key={p.idpublicacion}>
                  <div className="cardLeft">
                    <div className="thumb"><span className="noPhoto">Sin foto</span></div>
                  </div>

                  <div className="cardBody">
                    <div className="cardHead">
                      <div>
                        <h4 className="cardTitle">{p.titulo}</h4>
                        <p className="cardDesc">{p.descripcion}</p>
                      </div>
                      <div className="prefCol">{isPreferente ? <div className="prefBadge">Preferente</div> : null}</div>
                    </div>

                    <div className="cardMeta">
                      <div>
                        <div className="small">Impacto total</div>
                        <div className="impacto">{imp.total.toFixed(3)}</div>
                      </div>

                      <div className="priceCol">
                        <div className="small">Valor (Bs)</div>
                        <div className="price">Bs {precio.toFixed(2)} {descuento > 0 && <span className="subNote">(10% sus.)</span>}</div>
                      </div>
                    </div>

                    <div className="cardActions">
                      <button
                        className="buyBtn"
                        onClick={() => iniciarCompraMarketplace(p)}
                        disabled={processingId === p.idpublicacion}
                      >
                        {processingId === p.idpublicacion ? "Procesando..." : "Comprar créditos"}
                      </button>
                      <button className="detailBtn">Ver detalle</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* modal (markup similar al html original) */}
      <div id="modalBackdrop" className="modalBackdrop hidden">
        <div className="modal">
          <h3>Comprar suscripción</h3>
          <p className="text">Suscripción mensual: Bs 49.99 — otorga preferencia y 10% de descuento.</p>

          <div className="modalActions">
            <div>
              <div className="small">Precio</div>
              <div className="price">Bs 49.99 / mes</div>
            </div>
            <div>
              <button id="confirmSub" className="buyBtn">Comprar suscripción</button>
            </div>
          </div>

          <div className="modalClose"><button id="closeModal">Cancelar</button></div>
        </div>
      </div>

      <footer className="footer">Preview demo — integra con tus endpoints reales para funcionamiento completo.</footer>
    </div>
  );
}
