"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getPublicaciones, iniciarCompraConCreditoVerde } from "../service";

/**
 * Publicacion component - con integración de compra (credito verde)
 */

// ---------------------- TIPOS ----------------------
interface ApiPublicacion {
  idpublicacion: number;
  usuario_id: number;
  promocion_id: number | null;
  reporte_id: number | null;
  titulo: string;
  descripcion: string;
  valorCredito: string; // viene como "45.00"
  fechaPublicacion: string; // ISO
  estadoPublica: string;
  foto: string | null;
}

type Product = {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  description: string;
  status?: string;
  date?: string; // YYYY-MM-DD
  image?: string | null;
};

type Props = {
  puntos: number;
  setPuntos: React.Dispatch<React.SetStateAction<number>>;
};

const placeholderImage = "/image/placeholder.png";

export default function Publicacion({ puntos, setPuntos }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultsLabel, setResultsLabel] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyCantidad, setBuyCantidad] = useState<number>(1);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedBeforeModal = useRef<Element | null>(null);

  // ---------------------- CARGA DE DATOS ----------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await getPublicaciones();
        if (!mounted) return;

        // validar forma esperada
        if (!res || typeof res !== "object" || !Array.isArray((res as any).data)) {
          console.error("getPublicaciones: respuesta inválida", res);
          return;
        }

        const apiData = res.data as ApiPublicacion[];
        // mapear y tipar a Product
        const mapped: Product[] = apiData
  .filter((p) => String(p.estadoPublica ?? "").toLowerCase() === "activa") // solo activos
  .map((p) => {
    const priceNum = Number(parseFloat(p.valorCredito ?? "0") || 0);
    let dateStr = "";
    try {
      dateStr = p.fechaPublicacion ? new Date(p.fechaPublicacion).toISOString().slice(0, 10) : "";
    } catch {
      dateStr = "";
    }

    return {
      id: Number(p.idpublicacion),
      title: String(p.titulo ?? ""),
      price: isNaN(priceNum) ? 0 : priceNum,
      category: "General",
      description: String(p.descripcion ?? ""),
      status: String(p.estadoPublica ?? ""),
      date: dateStr,
      image: p.foto ?? placeholderImage
    };
  });


        setProducts(mapped);
        setFiltered(mapped);
        setResultsLabel(`${mapped.length} resultados`);
      } catch (err) {
        console.error("Error cargando publicaciones:", err);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------- FILTRADO (debounce) ----------------------
  function runFilter(currentProducts: Product[], q: string, cat: string, s: string) {
    const text = q.trim().toLowerCase();
    let list = currentProducts.filter((p) => {
      const matchText =
        !text ||
        p.title.toLowerCase().includes(text) ||
        p.description.toLowerCase().includes(text) ||
        p.category.toLowerCase().includes(text);
      const matchCat = cat === "all" || p.category === cat;
      return matchText && matchCat;
    });

    if (s === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (s === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (s === "newest") list.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());

    setFiltered(list);
    setResultsLabel(`${list.length} resultados`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      runFilter(products, query, category, sort);
    }, 140);
    return () => clearTimeout(timer);
  }, [query, category, sort, products]);

  // ---------------------- UTILIDADES / MODAL ----------------------
  function precioACreditos(precio: number) {
    // regla: 1 unidad -> 2 créditos (según tu ejemplo)
    return Math.round(precio * 2 * 100) / 100;
  }
  function formatPrecio(n: number) {
    try {
      return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
    } catch {
      return `CV${n.toFixed(2)}`;
    }
  }
  function relativeDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff)) return dateStr;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 30) return diff + " días";
    return d.toLocaleDateString();
  }

  function openModal(p: Product) {
    lastFocusedBeforeModal.current = document.activeElement;
    setSelected(p);
    setModalOpen(true);
    setBuyCantidad(1);
    setTimeout(() => {
      (modalRef.current?.querySelector<HTMLElement>("button") || modalRef.current)?.focus();
    }, 0);
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    setModalOpen(false);
    setSelected(null);
    document.body.style.overflow = "";
    if (lastFocusedBeforeModal.current instanceof HTMLElement) (lastFocusedBeforeModal.current as HTMLElement).focus();
  }

  // keyboard escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && modalOpen) closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "General"));
    return ["all", ...Array.from(set)];
  }, [products]);

  // ---------------------- COMPRA: integración con el backend ----------------------
  function getUsuarioIdFromSession(): number | null {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("usuario") : null;
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || (obj.idusuario === undefined && obj.id === undefined)) return null;
      // maneja ambos nombres posibles: idusuario o id
      return Number(obj.idusuario ?? obj.id);
    } catch (err) {
      console.warn("No se pudo leer usuario desde sessionStorage", err);
      return null;
    }
  }

  async function handleComprar(cantidad = 1) {
    if (!selected) {
      alert("Selecciona un producto antes de comprar.");
      return;
    }
    const compradorId = getUsuarioIdFromSession();
    if (!compradorId || isNaN(compradorId)) {
      alert("Usuario no autenticado. Inicia sesión para continuar.");
      return;
    }
    if (cantidad <= 0) {
      alert("Cantidad inválida. Debe ser al menos 1.");
      return;
    }

    try {
      setBuyLoading(true);
      // Llamada al endpoint (service) que ya tienes
      console.log(selected);
      const resp = await iniciarCompraConCreditoVerde(compradorId, selected.id, cantidad);
      console.log(resp)
      // resp expected: { success: true, data: { idintercambio: number } } o similar
      if (!resp) throw new Error("Respuesta inválida del servidor.");

      if (resp.success) {
        const idintercambio = resp.data?.idintercambio ?? null;
        if (idintercambio) {
          alert(`Compra iniciada correctamente. Intercambio ID: ${idintercambio}`);
          // aquí podrías redirigir o actualizar la UI
  setProducts((prev) => prev.filter((p) => p.id !== selected.id));
  setFiltered((prev) => prev.filter((p) => p.id !== selected.id));
  const nuevaBilletera = puntos - (selected.price); // según tu lógica
setPuntos(nuevaBilletera);

  closeModal();


        } else {
          // puede pasar si el SP devolvió NULL
          alert("La compra fue procesada pero no se recibió id de intercambio. Revisa el backend/LOGS.");
        }
      } else {
        // resp.success === false
        const msg = resp.message ?? "Error iniciando la compra.";
        alert(msg);
      }
    } catch (err: any) {
      console.error("Error en iniciarCompraConCreditoVerde:", err);
      alert("Error comunicándose con el servidor: " + (err?.message ?? String(err)));
    } finally {
      setBuyLoading(false);
    }
  }

  return (
    <section className="publicacion-root" aria-live="polite">
      <header className="container">
        <div className="brand" aria-hidden="false">
          <div className="logo" aria-hidden="true">PV</div>
          <div>
            <h1>Tienda de Reciclaje — Puntos Verdes</h1>
            <p className="subtitle">Productos y servicios sostenibles — doble clic o Enter para ver detalles</p>
          </div>
        </div>

        <div className="sr-only" id="resultsCount" aria-live="polite">
          {resultsLabel}
        </div>
      </header>

      <div className="controls" role="region" aria-label="Controles de búsqueda y filtro">
        <div className="searchBox" role="search">
          <div className="searchIcon" aria-hidden="true">
            🔎
          </div>
          <input
            type="text"
            id="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por producto, descripción o categoría..."
            aria-label="Buscar productos o servicios"
            autoComplete="off"
          />
        </div>

        <div className="filters" aria-label="Filtros">
          <select id="categoryFilter" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Todas las categorías" : c}
              </option>
            ))}
          </select>

          <select id="sortBy" className="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Más recientes</option>
            <option value="price-asc">Precio: menor → mayor</option>
            <option value="price-desc">Precio: mayor → menor</option>
          </select>
        </div>
      </div>

      <section className="grid" id="grid" aria-live="polite" aria-label="Resultados de productos">
        {filtered.length === 0 ? (
          <div className="empty">No se encontraron resultados</div>
        ) : (
          filtered.map((p) => (
            <article
              key={p.id}
              className={`card ${selected?.id === p.id ? "selected" : ""}`}
              tabIndex={0}
              role="button"
              aria-pressed="false"
              onClick={() => {
                document.querySelectorAll(".card").forEach((c) => c.classList.remove("selected"));
                (document.querySelector(`[data-id="${p.id}"]`) as HTMLElement)?.classList.add("selected");
                setSelected(p);
              }}
              onDoubleClick={() => openModal(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openModal(p);
                }
              }}
              data-id={p.id}
            >
              <div className="imgwrap">
                <img loading="lazy" src={p.image || placeholderImage} alt={p.title} />
                {p.oldPrice ? <div className="badge">OFERTA</div> : null}
                <div className="quick" aria-hidden="true">
                  <div className="tag">♻ {p.category}</div>
                </div>
              </div>

              <div className="meta">
                <div>
                  <div className="title">{p.title}</div>
                  <div className="desc">{p.description}</div>
                </div>
                <div className="meta-bottom">
                  <div>
                    <div className="price">{formatPrecio(p.price)}</div>
                    <div className="oldprice">{p.oldPrice ? formatPrecio(p.oldPrice) : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)" }}>
                    Publicado: {relativeDate(p.date)}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Modal */}
      <div
        className={`modal-backdrop ${modalOpen ? "open" : ""}`}
        id="modalBackdrop"
        aria-hidden={!modalOpen}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal" role="document" aria-labelledby="modalTitle" aria-describedby="modalDesc" ref={modalRef}>
          <button className="close-x" id="closeModal" aria-label="Cerrar diálogo" onClick={closeModal}>
            ✕
          </button>

          <div className="modal-left">
            <img id="modalImage" alt={selected?.title || "Imagen"} src={selected?.image || placeholderImage} />
          </div>

          <div className="m-body">
            <h2 id="modalTitle">{selected?.title}</h2>
            <p id="modalDesc">{selected?.description}</p>

            <div className="chips" id="modalChips">
              {selected && (
                <>
                  <div className="chip">Precio: {selected && formatPrecio(selected.price)}</div>
                  <div className="chip">Créditos verdes: {selected && precioACreditos(selected.price)}</div>
                  <div className="chip">Estado: {selected?.status}</div>
                  <div className="chip">Publicado: {selected?.date} ({relativeDate(selected?.date)})</div>
                  <div className="chip">Categoría: {selected?.category}</div>
                </>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Cantidad:</label>
              <input
                type="number"
                min={1}
                value={buyCantidad}
                onChange={(e) => setBuyCantidad(Math.max(1, Number(e.target.value || 1)))}
                style={{ width: 72 }}
                aria-label="Cantidad a comprar"
              />
            </div>

            <div className="modal-actions">
              <button
                id="btnComprar"
                className="btn-primary"
                onClick={() => handleComprar(buyCantidad)}
                disabled={buyLoading}
                aria-busy={buyLoading}
              >
                {buyLoading ? "Procesando..." : "Comprar / Interesado"}
              </button>

              <button id="btnCerrar" className="btn-outline" onClick={closeModal} disabled={buyLoading}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
