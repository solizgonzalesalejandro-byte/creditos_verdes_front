import React, { useEffect, useState } from "react";
import "./comprar_puntosCss.css";
import {
  ejecutarCompraCreditosSP,
  confirmarCompraCreditosSP,
  obtenerUsuarioSP,
  compraSuscripcionSP
} from "../service"; // AJUSTA LA RUTA SEGÚN TU PROYECTO

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
  apellido: string;
  billetera_id: number;
  idusuario: number;
  nombre: string;
  billetera: number;
  suscripcionActiva: boolean;
};
type Props = {
  puntos: number;
  setPuntos: React.Dispatch<React.SetStateAction<number>>;
};

/* ----- Component ----- */
export default function VistaComprarCreditosYSuscripcion({ puntos, setPuntos }: Props): JSX.Element {
  // demo / estado
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([
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

  // wallet local (valor mostrado)
  const [wallet, setWallet] = useState<number>(0);

  // usuario puede ser undefined si no hay sesión
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);

  // UI state
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Placeholder: en producción carga desde API
  useEffect(() => {
  const raw = sessionStorage.getItem("usuario");
  if (!raw) return;

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn("sessionStorage: usuario mal formado:", e);
    return;
  }

  (async () => {
    try {
      // obtenerUsuarioSP devuelve { success, data } según la implementación anterior
      console.log("Cargando usuario desde API para idusuario:", parsed);
      const resp = await obtenerUsuarioSP(parsed.idusuario);
      console.log("obtenerUsuarioSP respuesta:", resp);
      // soportar dos formatos: { success, data } o directamente data
      const usuarioData = resp?.data ?? resp;

      // si la API devolvió un array en data, tomar el primer elemento
      const first = Array.isArray(usuarioData) ? usuarioData[0] : usuarioData;

      if (!first || typeof first.idusuario !== "number") {
        console.warn("obtenerUsuarioSP devolvió formato inesperado:", resp);
        return;
      }

      const u = {
        apellido: String(first.apellido ?? ""),
        billetera_id: Number(first.billetera_id ?? 0),
        idusuario: Number(first.idusuario),
        nombre: String(first.nombre ?? "Usuario"),
        billetera: Number(first.billetera ?? 0),
        suscripcionActiva: Boolean(first.suscripcionActiva == 1 || first.suscripcionActiva === true),
      };

      setUsuario(u);
      setWallet(Number(u.billetera ?? 0));

      // opcional: actualizar sessionStorage con datos frescos
      try {
        sessionStorage.setItem("usuario", JSON.stringify(u));
      } catch (err) {
        console.warn("No se pudo actualizar sessionStorage:", err);
      }
    } catch (err: any) {
      console.warn("Error cargando usuario desde API:", err?.message ?? err);
      // keep previous session info (no cambios)
    }
  })();
}, []); // eslint-disable-line react-hooks/exhaustive-deps


  /* ----- Helpers ----- */
  function calcularImpacto(pub: Publicacion) {
    let co2 = 0;
    let en = 0;
    let ag = 0;
    if (!pub.categorias) return { total: 0, co2: 0, en: 0, ag: 0 };
    for (const c of pub.categorias) {
      const u = Number(c.cantidadUnidad ?? 0);
      co2 += u * (Number(c.tabla?.factorCO2 ?? 0));
      en += u * (Number(c.tabla?.factorEnergiaKwh ?? 0));
      ag += u * (Number(c.tabla?.factorAguaLitro ?? 0));
    }
    return { total: co2 + en + ag, co2, en, ag };
  }

  function publicacionesOrdenadas(): Publicacion[] {
    // lógica demo: preferir impares
    const preferidas = publicaciones.filter((p) => p.idpublicacion % 2 === 1);
    const resto = publicaciones.filter((p) => p.idpublicacion % 2 === 0);
    return [...preferidas, ...resto];
  }

  /* ----- Acciones ----- */
  async function iniciarCompraMarketplace(pub: Publicacion) {
    // protecciones: si no hay usuario o billetera_id, evitar continuar
    if (!usuario) {
      window.alert("Debes iniciar sesión antes de comprar.");
      return;
    }
    if (!usuario.billetera_id) {
      window.alert("Usuario no tiene billetera registrada.");
      return;
    }

    setProcessingId(pub.idpublicacion);

    try {
      const base = Number(pub.valorCredito ?? 0);
      const montoFinal = base;

      // 1️⃣ Crear la compra (llama sp_compra_creditos)
      const respCrear = await ejecutarCompraCreditosSP(
        usuario.idusuario,
        montoFinal,
        pub.valorCredito // créditos comprados (define tu propia regla)
      );

      if (!respCrear?.success) {
        throw new Error(respCrear?.message || "Error creando compra.");
      }

      const idcomp = respCrear?.data?.idcompra;

      if (!idcomp) {
        throw new Error("El SP no devolvió idcompra.");
      }

      // 3️⃣ Simular confirmación del pago (reemplazar luego por webhook real)
      setTimeout(async () => {
        try {
          // 4️⃣ Confirmar compra en el backend (sp_confirmar_compra_creditos)
          const respConfirm = await confirmarCompraCreditosSP(idcomp, montoFinal, "pago_marketplace");

          if (!respConfirm?.success) {
            throw new Error(respConfirm?.message || "Error confirmando compra.");
          }

          // 5️⃣ Actualizar billetera local de forma inmutable
          const nuevaBilletera = (usuario.billetera ?? 0) + montoFinal;
          setWallet(nuevaBilletera);
          setPuntos(nuevaBilletera);
          setUsuario((prev) => (prev ? { ...prev, billetera: nuevaBilletera } : prev));

          window.alert("Compra confirmada y acreditada.");
        } catch (err: any) {
          console.error("Error confirmando:", err);
          window.alert("Error confirmando la compra");
        } finally {
          setProcessingId(null);
        }
      }, 1500);
    } catch (err: any) {
      console.error("Error iniciarCompraMarketplace:", err);
      setProcessingId(null);
      window.alert("No se pudo iniciar la compra");
    }
  }

  function abrirModalSuscripcion() {
    setModalOpen(true);
  }

  function cerrarModalSuscripcion() {
    setModalOpen(false);
  }

  async function confirmarSuscripcion() {
  try {
    if (!usuario) {
      window.alert("Debes iniciar sesión.");
      return;
    }

    // 1) Si ya tiene suscripción activa → no continuar
    if (usuario.suscripcionActiva) {
      window.alert("Ya tienes una suscripción activa.");
      return;
    }

    const costoSuscripcion = 49.99;

    // 2) Validar saldo suficiente
    if (wallet < costoSuscripcion) {
      window.alert("Saldo insuficiente para comprar la suscripción.");
      return;
    }

    // 3) Consumir API
    const resp = await compraSuscripcionSP(usuario.idusuario, 1, costoSuscripcion);

    if (!resp?.success) {
      throw new Error(resp?.message || "Error al procesar la suscripción");
    }

    // 4) Actualizar estado del usuario
    setUsuario((prev) =>
      prev
        ? { ...prev, suscripcionActiva: true, billetera: prev.billetera - costoSuscripcion }
        : prev
    );

    // 5) Actualizar estado local de billetera
    setWallet((prev) => prev - costoSuscripcion);
    setPuntos(wallet);
    // Opcional: actualizar sessionStorage
    try {
      const nuevoUsuario = {
        ...usuario,
        suscripcionActiva: true,
        billetera: wallet - costoSuscripcion,
      };
      sessionStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    } catch {}

    cerrarModalSuscripcion();
    window.alert("Suscripción activada");

  } catch (err: any) {
    console.error("confirmarSuscripcion:", err);
    window.alert(err.message || "No se pudo completar la suscripción");
  }
}


  /* ----- Render ----- */
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
            {/* uso seguro de nombre y fallback */}
            <div className="userName">{usuario?.nombre ?? "Invitado"}</div>
            <div className="badge">{usuario?.suscripcionActiva ? "Preferente" : "Sin suscripción"}</div>
          </div>

          <div className="walletCard">
            <div className="small">Billetera</div>
            {/* muestra wallet local (estado) y fallback 0 */}
            <div className="walletAmount">Bs {wallet.toFixed(2)}</div>
          </div>

          <button onClick={abrirModalSuscripcion} className="subButton">Comprar suscripción</button>
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
                <li>Acceso a ofertas exclusivas</li>
              </ul>
            </div>
          </aside>

          <div className="content">
            {publicacionesOrdenadas().map((p) => {
              const imp = calcularImpacto(p);
              const precio = Number((p.valorCredito).toFixed(2));
              const isPreferente = Boolean(usuario?.suscripcionActiva && p.idpublicacion % 2 === 1);

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
                        <div className="price">
                          Bs {precio.toFixed(2)}
                        </div>
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

      {/* Modal: controlado por estado (accesible y reactivo) */}
      {modalOpen && (
        <div className="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <h3 id="modalTitle">Comprar suscripción</h3>
            <p className="text">Suscripción mensual: Bs 49.99.</p>

            <div className="modalActions">
              <div>
                <div className="small">Precio</div>
                <div className="price">Bs 49.99 / mes</div>
              </div>
              <div>
                <button
                  className="buyBtn"
                  onClick={async () => {
                    await confirmarSuscripcion();
                  }}
                >
                  Comprar suscripción
                </button>
              </div>
            </div>

            <div className="modalClose">
              <button onClick={cerrarModalSuscripcion}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">Preview demo — integra con tus endpoints reales para funcionamiento completo.</footer>
    </div>
  );
}
