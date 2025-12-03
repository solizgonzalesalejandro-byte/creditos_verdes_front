"use client";
import React, { useState, useEffect } from "react";
import "./crea_publiCss.css";
import { crearPublicacionSimple } from "../service"; // ajusta ruta si hace falta

// --- CONFIGURA ESTO ---
const CLOUD_NAME = "ddjrzszrw";         // <--- reemplaza si hace falta
const UPLOAD_PRESET = "servineo_unsigned"; // <--- reemplaza si hace falta
// -----------------------

export default function CrearPublicacion() {
  const placeholderImage = "https://via.placeholder.com/900x600?text=Sin+imagen";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // url (si el usuario pega una url)
  const [file, setFile] = useState<File | null>(null); // archivo seleccionado
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [msg, setMsg] = useState({ text: "", type: "", visible: false, loading: false });

  // derived preview values
  const previewTitle = title.trim() || "Título de la publicación";
  const previewDesc = description.trim()
    ? description.trim().length > 200
      ? description.trim().slice(0, 200) + "…"
      : description.trim()
    : "Descripción breve mostrada aquí.";
  const previewMeta = `${price ? "€" + (isNaN(Number(price)) ? "0.00" : parseFloat(price).toFixed(2)) : "€0.00"} · ${
    category || "Categoría"
  }`;
  const previewImage = filePreview || imageUrl.trim() || placeholderImage;

  useEffect(() => {
    let t: any;
    if (msg.visible) {
      t = setTimeout(() => setMsg((m) => ({ ...m, visible: false })), 3500);
    }
    return () => clearTimeout(t);
  }, [msg.visible]);

  useEffect(() => {
    // limpiar object URL al desmontar
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Validaciones para archivos (copiado estilo RegistroImagen)
  const maxSize = 5 * 1024 * 1024; // 2 MB (ajusta si querés)
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  function ensureUserInSession() {
    try {
      const raw = sessionStorage.getItem("usuario");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    // crear usuario ficticio (pruebas)
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

    if (!title.trim() || !description.trim() || !price || !category) {
      setMsg({ text: "❗ Por favor completa todos los campos obligatorios.", type: "error", visible: true, loading: false });
      return;
    }

    const precioN = Number(price);
    if (Number.isNaN(precioN) || precioN < 0) {
      setMsg({ text: "❗ Precio inválido.", type: "error", visible: true, loading: false });
      return;
    }

    // asegurar usuario en sessionStorage (o crear uno ficticio)
    const usuario = ensureUserInSession();
    const usuarioId = Number(usuario?.idusuario ?? 1);

    setMsg({ text: "⏳ Publicando...", type: "info", visible: true, loading: true });

    try {
      // Si hay archivo -> subilo y obten la URL; si no, usa imageUrl (si la puso)
      let fotoUrl = imageUrl?.trim() || "";
      if (file instanceof File) {
        fotoUrl = await uploadToCloudinary(file);
      } else if (!fotoUrl) {
        // si no hay ni archivo ni url -> usar placeholder
        fotoUrl = placeholderImage;
      }

      // Llamada al cliente que hace fetch al endpoint /publicacion
      const resp = await crearPublicacionSimple(
        usuarioId,
        title.trim(),
        description.trim(),
        precioN,
        "activa",
        fotoUrl,
        null,
        null
      );

      // manejar respuesta
      if (resp && (resp.success || resp.data?.idpublicacion || resp.idpublicacion)) {
        const id = resp.data?.idpublicacion ?? resp.idpublicacion ?? null;
        setMsg({ text: `✅ Publicación creada correctamente${id ? ` (id: ${id})` : ""}.`, type: "success", visible: true, loading: false });
        // limpiar
        setTitle(""); setDescription(""); setPrice(""); setCategory(""); setImageUrl(""); setFile(null);
        if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); }
      } else {
        const errorMsg = resp?.message ?? JSON.stringify(resp);
        setMsg({ text: `⚠️ Error: ${errorMsg}`, type: "error", visible: true, loading: false });
      }
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
              <label htmlFor="postPrice">Precio (EUR) *</label>
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
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                <option value="Ropa">Ropa</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Educación">Educación</option>
                <option value="Transporte">Transporte</option>
                <option value="Hogar">Hogar</option>
                <option value="Servicios">Servicios</option>
              </select>
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
