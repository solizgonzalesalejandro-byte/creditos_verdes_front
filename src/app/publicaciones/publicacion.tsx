import React, { useEffect, useRef, useState } from "react";
import styles from "./Marketplace.module.css";

type Product = {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  description: string;
  status: string;
  date: string; // ISO or Y-M-D
  image?: string;
};

const PLACEHOLDER = "/mnt/data/1eb785af-9e2b-4114-bc60-424064956dfc.png";

const SAMPLE_PRODUCTS: Product[] = [
  { id:1, title:"Freedom dress", price:22.74, oldPrice:34.99, category:"Ropa", description:"Vestido fresco y cómodo, hecho con telas recicladas.", status:"Publicado", date:"2025-11-20", image:PLACEHOLDER },
  { id:2, title:"Camisetas personalizadas", price:14.99, oldPrice:20, category:"Ropa", description:"Camiseta unisex personalizable con impresión ecológica.", status:"Publicado", date:"2025-11-01", image:PLACEHOLDER },
  { id:3, title:"Curso intensivo español", price:499, category:"Educación", description:"Curso profesional en español con enfoque sostenible.", status:"Publicado", date:"2025-10-22", image:PLACEHOLDER },
  { id:4, title:"Smartphone XYZ", price:699, category:"Tecnología", description:"Móvil gama alta con piezas recicladas y garantía ético-reparadora.", status:"Publicado", date:"2025-10-10", image:PLACEHOLDER },
  { id:5, title:"Servicio de mensajería", price:12, category:"Transporte", description:"Envíos rápidos y con reparto en bicicleta para reducir huella.", status:"Publicado", date:"2025-09-05", image:PLACEHOLDER },
  { id:6, title:"Silla ergonómica", price:88, category:"Hogar", description:"Silla con soporte lumbar fabricada con materiales reciclados.", status:"Publicado", date:"2025-11-10", image:PLACEHOLDER }
];

export default function Marketplace({ initial = SAMPLE_PRODUCTS }: { initial?: Product[] }) {
  const [products] = useState<Product[]>(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [results, setResults] = useState<Product[]>(products);

  const [openItem, setOpenItem] = useState<Product | null>(null);

  // focus trap refs
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    filterAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, sortBy]);

  useEffect(() => {
    if (openItem) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      // focus modal after render
      setTimeout(() => modalRef.current?.focus(), 0);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpenItem(null);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    } else {
      // restore focus
      lastFocusedRef.current?.focus();
    }
  }, [openItem]);

  function precioACreditos(precio: number) {
    return Math.round(precio * 2 * 100) / 100;
  }

  function formatPrecio(n: number) {
    try {
      return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
    } catch {
      return `${n} €`;
    }
  }

  function relativeDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff)) return dateStr;
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 30) return diff + " días";
    return d.toLocaleDateString();
  }

  function filterAndSort() {
    const t = query.trim().toLowerCase();
    let fil = products.filter((p) => {
      const matchText =
        !t ||
        p.title.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t);
      const matchCat = category === "all" || p.category === category;
      return matchText && matchCat;
    });

    if (sortBy === "price-asc") fil.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") fil.sort((a, b) => b.price - a.price);
    else fil.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setResults(fil);
  }

  // simple focus trap inside modal (only when modal open)
  function trapFocus(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>PV</div>
          <div>
            <h1>Tienda de Reciclaje — Puntos Verdes</h1>
            <p className={styles.subtitle}>Productos y servicios sostenibles — doble clic o Enter para ver detalles</p>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">
          {results.length} resultados
        </div>
      </header>

      <div className={styles.controls} role="region" aria-label="Controles de búsqueda y filtro">
        <div className={styles.searchBox} role="search">
          <div className={styles.searchIcon}>🔎</div>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por producto, descripción o categoría..."
            aria-label="Buscar productos o servicios"
            autoComplete="off"
          />
        </div>

        <div className={styles.filters}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por categoría">
            <option value="all">Todas las categorías</option>
            <option value="Ropa">Ropa</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Educación">Educación</option>
            <option value="Transporte">Transporte</option>
            <option value="Hogar">Hogar</option>
            <option value="Servicios">Servicios</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Ordenar resultados">
            <option value="newest">Más recientes</option>
            <option value="price-asc">Precio: menor → mayor</option>
            <option value="price-desc">Precio: mayor → menor</option>
          </select>
        </div>
      </div>

      <section className={styles.grid} aria-live="polite" aria-label="Resultados de productos">
        {results.length === 0 && <div className={styles.empty}>No se encontraron resultados</div>}

        {results.map((p) => (
          <article
            key={p.id}
            tabIndex={0}
            role="button"
            className={styles.card}
            onClick={(e) => {
              // selection visual
              const cards = document.querySelectorAll(`.${styles.card}`);
              cards.forEach((c) => c.classList.remove(styles.selected));
              (e.currentTarget as HTMLElement).classList.add(styles.selected);
            }}
            onDoubleClick={() => setOpenItem(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenItem(p);
              }
            }}
          >
            <div className={styles.imgwrap}>
              <img loading="lazy" src={p.image || PLACEHOLDER} alt={p.title} />
              {p.oldPrice ? <div className={styles.badge}>OFERTA</div> : null}
              <div className={styles.quick} aria-hidden="true">
                <div className={styles.tag}>♻ {p.category}</div>
              </div>
            </div>

            <div className={styles.meta}>
              <div>
                <div className={styles.title}>{p.title}</div>
                <div className={styles.desc}>{p.description}</div>
              </div>

              <div className={styles.metaBottom}>
                <div>
                  <div className={styles.price}>{formatPrecio(p.price)}</div>
                  <div className={styles.oldprice}>{p.oldPrice ? formatPrecio(p.oldPrice) : ""}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)" }}>
                  Publicado: {relativeDate(p.date)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Modal */}
      {openItem && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          aria-describedby="modalDesc"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenItem(null);
          }}
        >
          <div
            className={styles.modal}
            ref={modalRef}
            tabIndex={-1}
            onKeyDown={trapFocus}
            // allow focusing
          >
            <button className={styles.closeX} onClick={() => setOpenItem(null)} aria-label="Cerrar diálogo">
              ✕
            </button>

            <div className={styles.modalLeft}>
              <img src={openItem.image || PLACEHOLDER} alt={openItem.title} />
            </div>

            <div className={styles.mBody}>
              <h2 id="modalTitle">{openItem.title}</h2>
              <p id="modalDesc">{openItem.description}</p>

              <div className={styles.chips}>
                <div className={styles.chip}>Precio: {formatPrecio(openItem.price)}</div>
                <div className={styles.chip}>Créditos verdes: {precioACreditos(openItem.price)}</div>
                <div className={styles.chip}>Estado: {openItem.status}</div>
                <div className={styles.chip}>Publicado: {openItem.date}</div>
                <div className={styles.chip}>Categoría: {openItem.category}</div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    alert("Interés registrado (simulado). Gracias por apoyar la economía circular ♻️");
                  }}
                >
                  Comprar / Interesado
                </button>
                <button className={styles.btnOutline} onClick={() => setOpenItem(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
