"use client";
import React, { useState, useEffect } from "react";
import "./crea_publiCss.css";
import { publicarConImpacto, modificarPublicacion,getCategorias } from "../service"; // ajusta ruta si hace falta

// --- CONFIGURA ESTO ---
// Usa tus credenciales/constantes Cloudinary (o las que usas en RegistroImagen.tsx)
const CLOUD_NAME = "ddjrzszrw";         // <--- reemplaza si hace falta
const UPLOAD_PRESET = "servineo_unsigned"; // <--- reemplaza si hace falta
// -----------------------

export default function CrearPublicacion() {
  const placeholderImage = "https://via.placeholder.com/900x600?text=Sin+imagen";

  type Categoria = {
  idcatalogo: number;
  nombreCategoria: string;
  tipoCategoria: string;
};

const [categorias, setCategorias] = useState<Categoria[]>([]);
const [loadingCategorias, setLoadingCategorias] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("kWh_solar"); // default
  const [cantidadUnidad, setCantidadUnidad] = useState("1"); // default 1

  const [imageUrl, setImageUrl] = useState(""); // url (si el usuario pega una url)
  const [file, setFile] = useState<File | null>(null); // archivo seleccionado
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [msg, setMsg] = useState({ text: "", type: "" as "error" | "success" | "info", visible: false, loading: false });

  // derived preview values
  const previewTitle = title.trim() || "Título de la publicación";
  const previewDesc = description.trim()
    ? description.trim().length > 200
      ? description.trim().slice(0, 200) + "…"
      : description.trim()
    : "Descripción breve mostrada aquí.";
  const previewMeta = `${price ? "€" + (isNaN(Number(price)) ? "0.00" : parseFloat(price).toFixed(2)) : "€0.00"} · ${category || "Categoría"}`;
  const previewImage = filePreview || imageUrl.trim() || placeholderImage;
useEffect(() => {
  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const resp = await getCategorias();

      if (resp?.success && Array.isArray(resp.data)) {
        setCategorias(resp.data);
      } else {
        console.error("Formato inválido de categorías:", resp);
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  cargarCategorias();
}, []);

  useEffect(() => {
    let t: any;
    if (msg.visible) t = setTimeout(() => setMsg((m) => ({ ...m, visible: false })), 3500);
    return () => clearTimeout(t);
  }, [msg.visible]);

  useEffect(() => {
    // limpiar object URL cuando cambie filePreview
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Validaciones para archivos (ajusta según necesites)
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  function ensureUserInSession() {
    try {
      const raw = sessionStorage.getItem("usuario");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    // si no hay usuario en sesión, creamos uno de prueba (útil en dev)
    const fakeUser = {
      idusuario: 1,
      nombre: "Usuario",
      apellido: "Demo",
      nombreUser: "demo_user",
      billetera_id: null,
    };
    const fakeRoles = ["user"];
    sessionStorage.setItem("usuario", JSON.stringify(fakeUser));
    sessionStorage.setItem("roles", JSON.stringify(fakeRoles));
    sessionStorage.setItem("login", "true");
    return fakeUser;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); }
      return;
    }
    if (!allowedTypes.includes(selected.type)) {
      setMsg({ text: "Formato no permitido. Usa JPG/PNG/WebP.", type: "error", visible: true, loading: false });
      return;
    }
    if (selected.size > maxSize) {
      setMsg({ text: `Archivo demasiado grande. Máx ${Math.round(maxSize/1024/1024)}MB.`, type: "error", visible: true, loading: false });
      return;
    }
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    // limpiar cualquier url antigua
    setImageUrl("");
  };

  // Subir a Cloudinary (unsigned) -> devuelve secure_url
  async function uploadToCloudinary(fileOrUrl: File | string): Promise<string> {
    const fd = new FormData();
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("file", fileOrUrl);
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: fd,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = (data && (data as any).error && (data as any).error.message) || resp.statusText;
      throw new Error(`Cloudinary ${resp.status}: ${msg}`);
    }
    if (!data?.secure_url) throw new Error("Cloudinary no devolvió secure_url");
    return String((data as any).secure_url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validaciones básicas
    if (!title.trim() || !description.trim() || !price || !category) {
      setMsg({ text: "❗ Por favor completa todos los campos obligatorios.", type: "error", visible: true, loading: false });
      return;
    }

    if (!unidadMedida || !cantidadUnidad) {
      setMsg({ text: "❗ Debes especificar la unidad de medida y la cantidad.", type: "error", visible: true, loading: false });
      return;
    }

    const precioN = Number(price);
    const cantidadN = Number(cantidadUnidad);

    if (Number.isNaN(precioN) || precioN < 0) {
      setMsg({ text: "❗ Precio inválido.", type: "error", visible: true, loading: false });
      return;
    }
    if (Number.isNaN(cantidadN) || cantidadN <= 0) {
      setMsg({ text: "❗ Cantidad inválida.", type: "error", visible: true, loading: false });
      return;
    }

    // usuario
    const usuario = ensureUserInSession();
    const usuarioId = Number(usuario?.idusuario ?? 1);

    setMsg({ text: "⏳ Publicando...", type: "info", visible: true, loading: true });

    try {
      // Primero: subir imagen (si file) o usar imageUrl, o placeholder
      let fotoUrl = imageUrl?.trim() || "";
      if (file instanceof File) {
        fotoUrl = await uploadToCloudinary(file);
      } else if (!fotoUrl) {
        fotoUrl = placeholderImage;
      }

      // Llamada al endpoint publicarConImpacto
      const resp = await publicarConImpacto(
        usuarioId,
        category,
        unidadMedida,
        title.trim(),
        description.trim(),
        precioN,
        cantidadN,
        fotoUrl
      );

      // Manejo respuesta: tu service devuelve { idpublicacion: ... } dentro de data o directamente
      const idpublicacion = resp?.data?.idpublicacion ?? resp?.idpublicacion ?? null;

      if (!idpublicacion) {
        // fallo creación
        const errorMsg = resp?.message ?? JSON.stringify(resp);
        setMsg({ text: `⚠️ Error al crear publicación: ${errorMsg}`, type: "error", visible: true, loading: false });
        return;
      }

      // Si hay foto válida distinta al placeholder, actualizamos la publicación con foto usando PUT /publicacion
      /*if (fotoUrl && fotoUrl !== placeholderImage) {
        try {
          await modificarPublicacion({ idpublicacion: Number(idpublicacion), foto: fotoUrl });
        } catch (errMod: any) {
          // No abortamos el flujo por error en foto; avisamos pero la publicación ya existe.
          console.warn("No se pudo actualizar foto en publicacion:", errMod);
          setMsg({ text: `✅ Publicación creada (id:${idpublicacion}) pero no se guardó la foto: ${errMod?.message ?? String(errMod)}`, type: "success", visible: true, loading: false });
          // limpiar campos
          setTitle(""); setDescription(""); setPrice(""); setCategory(""); setImageUrl(""); setFile(null);
          if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); }
          return;
        }
      }*/

      // éxito completo
      setMsg({ text: `✅ Publicación creada correctamente (id: ${idpublicacion}).`, type: "success", visible: true, loading: false });
      // limpiar
      setTitle(""); setDescription(""); setPrice(""); setCategory(""); setImageUrl(""); setFile(null);
      if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); }
    } catch (err: any) {
      console.error("crearPublicacion error:", err);
      setMsg({ text: `❌ Error al crear publicación: ${err?.message ?? String(err)}`, type: "error", visible: true, loading: false });
    }
  }

  return (
    <main className="container" role="main" aria-labelledby="pageTitle">
      <section>
        <header>
          <h1 id="pageTitle">➕ Crear Nueva Publicación</h1>
          <p>Completa los datos del producto o servicio. Los campos con * son obligatorios.</p>
        </header>

        <form id="newPostForm" noValidate onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postTitle">Título *</label>
            <input
              type="text"
              id="postTitle"
              name="title"
              required
              placeholder="Ej: Bicicleta de montaña usada"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="postDesc">Descripción *</label>
            <textarea
              id="postDesc"
              name="description"
              required
              placeholder="Describe el artículo, su estado y características..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="postPrice">Precio (CV) *</label>
              <input
                type="number"
                id="postPrice"
                name="price"
                required
                min="0"
                step="0.01"
                placeholder="Ej: 88.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group col">
              <label htmlFor="postCategory">Categoría *</label>
              <select
  id="postCategory"
  name="category"
  required
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  disabled={loadingCategorias}
>
  <option value="">
    {loadingCategorias ? "Cargando categorías..." : "Selecciona una categoría"}
  </option>

  {categorias.map((cat) => (
    <option key={cat.idcatalogo} value={cat.nombreCategoria}>
      {cat.nombreCategoria}
    </option>
  ))}
</select>

            </div>
          </div>

          {/* Campos para publicar con impacto */}
          <div className="form-row" style={{ gap: 12 }}>
            <div className="form-group col">
              <label htmlFor="unidadMedida">Unidad de medida (impacto) *</label>
              <select id="unidadMedida" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}>
                <option value="kWh_solar">kWh_solar</option>
                <option value="kg_plastico">kg_plastico</option>
                <option value="kg_papel">kg_papel</option>
                <option value="unidad">unidad</option>
              </select>
            </div>

            <div className="form-group col">
              <label htmlFor="cantidadUnidad">Cantidad (impacto) *</label>
              <input
                type="number"
                id="cantidadUnidad"
                min="0.0001"
                step="0.0001"
                value={cantidadUnidad}
                onChange={(e) => setCantidadUnidad(e.target.value)}
                placeholder="Ej: 1.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Imagen (elige archivo o pega URL)</label>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <label htmlFor="fileInput" className="btn-upload" style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid #333", borderRadius: 6 }}>
                Seleccionar imagen
              </label>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              <input
                type="text"
                placeholder="O pega una URL pública de imagen"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); setFile(null); } }}
                style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd" }}
              />
            </div>

            <div className="note">Recomendado: JPG/PNG/WebP. Máx {Math.round(maxSize/1024/1024)} MB.</div>
          </div>

          <button type="submit" className="btn-publish" id="btnPublish" disabled={msg.loading}>
            {msg.loading ? "Publicando…" : "Publicar Artículo"}
          </button>

          <div className="msg" id="msgSuccess" role="status" aria-live="polite" aria-atomic="true"
               style={{ display: msg.visible ? "block" : "none", background: msg.type === 'error' ? 'linear-gradient(90deg, rgba(255,230,230,0.9), rgba(255,245,245,0.6))' : 'linear-gradient(90deg, rgba(220,255,220,0.95), rgba(240,255,240,0.9))', color: msg.type === 'error' ? '#8a1f1f' : 'var(--green-dark)' }}>
            {msg.text}
          </div>
        </form>
      </section>

      <aside className="aside" aria-label="Vista previa y ayuda">
        <div style={{ marginBottom: 12, fontWeight: 700, color: 'var(--green-dark)' }}>Vista previa</div>

        <div className="preview-card" id="previewCard" aria-hidden="false">
          <img className="preview-image" id="previewImage" src={previewImage} alt="Imagen de la publicación" />
          <div className="preview-body">
            <div className="preview-title" id="previewTitle">{previewTitle}</div>
            <div className="preview-meta" id="previewMeta">{previewMeta}</div>
            <div className="preview-desc" id="previewDesc">{previewDesc}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: '0.95rem', color: 'var(--muted)' }}>
          <strong>Consejos rápidos:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0, color: '#2b5a30' }}>
            <li>Usa fotos nítidas y bien iluminadas.</li>
            <li>Describe el estado (nuevo/usado) y medidas si aplica.</li>
            <li>Elige categoría correcta para mejorar búsquedas.</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
