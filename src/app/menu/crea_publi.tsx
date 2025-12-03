"use client";
import React, { useState, useEffect } from "react";
import "./crea_publiCss.css";

export default function CrearPublicacion() {
  const placeholderImage = "https://via.placeholder.com/900x600?text=Sin+imagen";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const [msg, setMsg] = useState({ text: "", type: "", visible: false });

  // derived preview values
  const previewTitle = title.trim() || "Título de la publicación";
  const previewDesc = description.trim()
    ? description.trim().length > 200
      ? description.trim().slice(0, 200) + "…"
      : description.trim()
    : "Descripción breve mostrada aquí.";
  const previewMeta = `${price ? "€" + parseFloat(price).toFixed(2) : "€0.00"} · ${
    category || "Categoría"
  }`;
  const previewImage = image.trim() || placeholderImage;

  useEffect(() => {
    let t;
    if (msg.visible) {
      t = setTimeout(() => setMsg((m) => ({ ...m, visible: false })), 3000);
    }
    return () => clearTimeout(t);
  }, [msg.visible]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price || !category) {
      setMsg({
        text: "❗ Por favor completa todos los campos obligatorios.",
        type: "error",
        visible: true,
      });
      return;
    }

    const newPost = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      image: image.trim() || placeholderImage,
      date: new Date().toISOString(),
    };

    // Aquí puedes hacer fetch a tu endpoint: fetch('/api/publicaciones', ...)
    console.log("Nueva publicación (simulada):", newPost);

    setMsg({ text: "✅ Publicación creada correctamente. (Simulado)", type: "success", visible: true });
    resetForm();
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
            <label htmlFor="postImage">URL de la imagen (opcional)</label>
            <input
              type="text"
              id="postImage"
              name="image"
              placeholder="https://... (si no pones, usaremos una imagen por defecto)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <div className="note">Recomendado: imagen cuadrada o 4:3 para mejor presentación.</div>
          </div>

          <button type="submit" className="btn-publish" id="btnPublish">
            Publicar Artículo
          </button>

          <div className="msg" id="msgSuccess" role="status" aria-live="polite" aria-atomic="true" style={{ display: msg.visible ? "block" : "none", background: msg.type === 'error' ? 'linear-gradient(90deg, rgba(255,230,230,0.9), rgba(255,245,245,0.6))' : 'linear-gradient(90deg, rgba(220,255,220,0.95), rgba(240,255,240,0.9))', color: msg.type === 'error' ? '#8a1f1f' : 'var(--green-dark)' }}>
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
