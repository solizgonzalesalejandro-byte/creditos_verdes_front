// cliente: services/auth.client.ts (ejemplo)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // ajusta

export async function login(nombreUser: string, contrasenia: string, roles: string[] = []) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreUser, contrasenia, roles })
  });

  const data = await res.json();
  return data; // { success: true, usuario, roles }
}
export async function registrarUsuarioCompleto(
  nombre: string,
  apellido: string,
  nombreUser: string,
  contrasenia: string,
  roles: string[]
) {
  const data = { nombre, apellido, nombreUser, contrasenia, roles };

  const resp = await fetch(`${BASE_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function modificarUsuario(
  nombreUser: string,
  nuevoNombre: string,
  nuevoApellido: string,
  nuevaContrasenia: string
) {
  const user = { nombreUser, nuevoNombre, nuevoApellido, nuevaContrasenia };

  const resp = await fetch(`${BASE_URL}/usuario/modificar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  return resp.json();
}

export async function registrarAcceso(
  usuario: string,
  ip: string,
  userAgent: string,
  exito: boolean,
  motivo?: string
) {
  const data = { usuario, ip, userAgent, exito, motivo };

  const resp = await fetch(`${BASE_URL}/usuario/registrar-acceso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function upsertReporte(
  usuarioId: number,
  CO2?: number,
  Energia?: number,
  Agua?: number
) {
  const data = { usuarioId, CO2, Energia, Agua };

  const resp = await fetch(`${BASE_URL}/usuario/upsert-reporte`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function publicarConImpacto(
  usuarioId: number,
  nombreCategoria: string,
  unidadMedida: string,
  titulo: string,
  descripcion: string,
  valorCredito: number,
  cantidadUnidad: number,
  foto:string
) {
  const data = { usuarioId, nombreCategoria, unidadMedida, titulo, descripcion, valorCredito, cantidadUnidad, foto };

  const resp = await fetch(`${BASE_URL}/publicacion/con-impacto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function recargarBilletera(
  usuarioId: number,
  monto: number,
  descripcion?: string
) {
  const data = { usuarioId, monto, descripcion };

  const resp = await fetch(`${BASE_URL}/usuario/recargar-billetera`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function iniciarCompraConCreditoVerde(
  compradorId: number,
  idpublicacion: number,
  cantidad: number
) {
  const data = { compradorId, idpublicacion, cantidad };

  const resp = await fetch(`${BASE_URL}/compra/iniciar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function liberarPagoConCreditoVerde(idintercambio: number) {
  const data = { idintercambio };

  const resp = await fetch(`${BASE_URL}/compra/liberar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function cancelarIntercambioActor(
  idIntercambio: number,
  actorUsuarioId: number
) {
  const data = { idIntercambio, actorUsuarioId };

  const resp = await fetch(`${BASE_URL}/intercambio/cancelar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

export async function getAllUsers() {
  const resp = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return resp.json();
}
// --- Añadir al archivo de cliente (services/auth.client.ts o service.ts) ---
// GET / /procedures?schema=mydb
export async function getStoredProcedures(schema: string = "mydb") {
  const url = `${BASE_URL}/procedures?schema=${encodeURIComponent(schema)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/usuarios/roles
export async function getUsuariosConRoles() {
  const url = `${BASE_URL}/usuarios/roles`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/impacto/por-titulo?titulo=...
export async function getImpactoPorTitulo(titulo: string) {
  if (!titulo) throw new Error("titulo es requerido");
  const url = `${BASE_URL}/impacto/por-titulo?titulo=${encodeURIComponent(titulo)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/publicaciones
export async function getPublicaciones() {
  const url = `${BASE_URL}/publicaciones`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/publicaciones/impacto/search?term=solar
export async function searchPublicacionesImpacto(term: string) {
  if (!term) throw new Error("term es requerido");
  const url = `${BASE_URL}/publicaciones/impacto/search?term=${encodeURIComponent(term)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/intercambios/pendientes
export async function getIntercambiosPendientes() {
  const url = `${BASE_URL}/intercambios/pendientes`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/impacto/usuarios
export async function getImpactoUsuarios() {
  const url = `${BASE_URL}/impacto/usuarios`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/usuarios/mas-ecologicos
export async function getUsuariosMasEcologicos() {
  const url = `${BASE_URL}/usuarios/mas-ecologicos`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/compras/completadas
export async function getComprasCompletadas() {
  const url = `${BASE_URL}/compras/completadas`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/acceso?limit=200
export async function getBitacoraAcceso(limit: number = 200) {
  const url = `${BASE_URL}/bitacora/acceso?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/historico/consolidado?limit=200
export async function getHistoricoConsolidado(limit: number = 200) {
  const url = `${BASE_URL}/historico/consolidado?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/billetera/extracto?nombreUser=ale1234&limit=200
export async function getExtractoBilletera(nombreUser: string, limit: number = 200) {
  if (!nombreUser) throw new Error("nombreUser es requerido");
  const url = `${BASE_URL}/billetera/extracto?nombreUser=${encodeURIComponent(nombreUser)}&limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/compras/creditos
export async function getCompraCreditos() {
  const url = `${BASE_URL}/compras/creditos`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/intercambio?limit=200
export async function getBitacoraIntercambio(limit: number = 200) {
  const url = `${BASE_URL}/bitacora/intercambio?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/usuario?limit=200
export async function getBitacoraUsuario(limit: number = 200) {
  const url = `${BASE_URL}/bitacora/usuario?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// DELETE /user/:id
export async function eliminarUsuarioPorId(id: number) {
  const resp = await fetch(`${BASE_URL}/user/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  return resp.json();
}

// DELETE /publicacion/:id
export async function eliminarPublicacionPorId(id: number) {
  const resp = await fetch(`${BASE_URL}/publicacion/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  return resp.json();
}

// POST /compras/creditos
// Body: { usuarioId, montoBs, creditos, metodo? }
export async function compraCreditos(
  usuarioId: number,
  montoBs: number,
  creditos: number,
  metodo?: string
) {
  const data = { usuarioId, montoBs, creditos, metodo };

  const resp = await fetch(`${BASE_URL}/compras/creditos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return resp.json();
}

// GET /buscar/publicaciones?texto=...&categoria=...&offset=0&limit=50
export async function buscarPublicaciones(texto?: string, categoria?: string, offset: number = 0, limit: number = 50) {
  const params = new URLSearchParams();
  if (texto) params.append("texto", texto);
  if (categoria) params.append("categoria", categoria);
  params.append("offset", String(offset));
  params.append("limit", String(limit));

  const resp = await fetch(`${BASE_URL}/buscar/publicaciones?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  return resp.json();
}

// PUT /publicacion
// Body: { idpublicacion, titulo?, descripcion?, valorCredito?, estado?, foto? }
export async function modificarPublicacion(payload: any) {
  const resp = await fetch(`${BASE_URL}/publicacion`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return resp.json();
}

// GET /impacto/semana
export async function getImpactoSemana() {
  const url = `${BASE_URL}/impacto/semana`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /ranking/usuarios
export async function getRankingUsuarios() {
  const url = `${BASE_URL}/ranking/usuarios`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /ranking/top10
export async function getTop10Ranking() {
  const url = `${BASE_URL}/ranking/top10`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /views?schema=mydb
export async function listViews(schema: string = "mydb") {
  const url = `${BASE_URL}/views?schema=${encodeURIComponent(schema)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// POST /publicacion
export async function crearPublicacionSimple(
  usuarioId: number,
  titulo: string,
  descripcion?: string | null,
  valorCredito?: number | null,
  estadoPublica?: string | null,
  foto?: string | null,
  promocionId?: number | null,
  reporteId?: number | null
) {
  if (!usuarioId) throw new Error("usuarioId es requerido");
  if (!titulo || !String(titulo).trim()) throw new Error("titulo es requerido");

  const body = {
    usuarioId,
    titulo,
    descripcion: descripcion ?? null,
    valorCredito: valorCredito ?? null,
    estadoPublica: estadoPublica ?? "activa",
    foto: foto ?? null,
    promocionId: promocionId ?? null,
    reporteId: reporteId ?? null,
  };

  const resp = await fetch(`${BASE_URL}/publicacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return resp.json();
}

// GET /perfil/me?idusuario=...
export async function getPerfilConsolidado(idusuario: number) {
  if (!idusuario) throw new Error("idusuario es requerido");

  const url = `${BASE_URL}/perfil/me?idusuario=${encodeURIComponent(String(idusuario))}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  return resp.json(); // -> { success: true, data: { ...perfil } }
}

/**
 * GET /resumen/ganancias?fechaIni=YYYY-MM-DD&fechaFin=YYYY-MM-DD
 * Retorna: { success: true, data: { global, desglose, topCompradores } }
 */
export async function getResumenGanancias(fechaIni: string, fechaFin: string) {
  if (!fechaIni || !fechaFin) throw new Error("fechaIni y fechaFin son requeridos (YYYY-MM-DD)");
  const params = new URLSearchParams({ fechaIni, fechaFin });
  const resp = await fetch(`${BASE_URL}/resumen/ganancias?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return resp.json();
}

/**
 * POST /sp/compra-creditos
 * Body: { usuarioId, montoBs, creditos, metodo? }
 * Retorna: { success: true, data: { success: boolean, idcompra: number | null } }
 */
export async function ejecutarCompraCreditosSP(
  usuarioId: number,
  montoBs: number,
  creditos: number,
  metodo: string = "tarjeta"
) {
  // Validación más robusta
  if (
    !Number.isFinite(usuarioId) ||
    !Number.isFinite(montoBs) ||
    !Number.isFinite(creditos)
  ) {
    throw new Error("usuarioId, montoBs y creditos deben ser numéricos válidos");
  }

  const body = { usuarioId, montoBs, creditos, metodo };

  const resp = await fetch(`${BASE_URL}/sp/compra-creditos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return resp.json();
}


/**
 * POST /sp/confirmar-compra
 * Body: { idcomp, montoBs, metodo? }
 * Retorna: { success: true, message: "Compra confirmada" } u objeto de error
 */
export async function confirmarCompraCreditosSP(
  idcomp: number,
  montoBs: number,
  metodo: string = "tarjeta"
) {
  if (idcomp === undefined || idcomp === null || montoBs === undefined || montoBs === null) {
    throw new Error("idcomp y montoBs son requeridos");
  }

  const body = { idcomp, montoBs, metodo };
  const resp = await fetch(`${BASE_URL}/sp/confirmar-compra`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return resp.json();
}

export async function obtenerUsuarioSP(idusuario: string) {
  if (!idusuario || Number.isNaN(Number(idusuario))) {
    throw new Error("idusuario es requerido y debe ser numérico");
  }

  const resp = await fetch(`${BASE_URL}/api/usuario/${idusuario}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();

  if (!resp.ok) {
    // Manejo de errores más claro
    throw new Error(data?.message ?? "Error obteniendo usuario");
  }

  return data; // { success: true, data: {...usuario} }
}

export async function compraSuscripcionSP(usuarioId: number, meses: number, monto: number) {
  if (!usuarioId || Number.isNaN(Number(usuarioId))) {
    throw new Error("usuarioId es requerido y debe ser numérico");
  }
  if (!meses || Number.isNaN(Number(meses))) {
    throw new Error("meses es requerido y debe ser numérico");
  }
  if (!monto || Number.isNaN(Number(monto))) {
    throw new Error("monto es requerido y debe ser numérico");
  }

  const body = { usuarioId, meses, monto };

  const resp = await fetch(`${BASE_URL}/api/compra-suscripcion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.message ?? "Error procesando compra de suscripción");
  }

  return data; // { success: true, data: ... }
}
/* ===========================================================
   1) IMPACTO SEMANAL — GET /impacto/semana
=========================================================== */
export async function obtenerImpactoSemanaSP() {
  const resp = await fetch(`${BASE_URL}/impacto/semana`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.message ?? "Error obteniendo impacto por semana");
  }

  return data; 
  // { success: true, data: [...], count: number }
}

/* ===========================================================
   2) RANKING USUARIOS — GET /ranking/usuarios
=========================================================== */
export async function obtenerRankingUsuariosSP() {
  const resp = await fetch(`${BASE_URL}/ranking/usuarios`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.message ?? "Error obteniendo ranking de usuarios");
  }

  return data;
}

/* ===========================================================
   3) TOP 10 RANKING — GET /ranking/top10
=========================================================== */
export async function obtenerTop10RankingSP() {
  const resp = await fetch(`${BASE_URL}/ranking/top10`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.message ?? "Error obteniendo top 10 ranking");
  }

  return data;
}

/* ===========================================================
   4) LISTAR VISTAS — GET /views?schema=mydb
=========================================================== */
export async function obtenerVistasSP(schema: string = "mydb") {
  if (!schema) throw new Error("schema es requerido");

  const resp = await fetch(`${BASE_URL}/views?schema=${encodeURIComponent(schema)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.message ?? "Error listando vistas");
  }

  return data;
}

export async function getPlataformaIngresos() {
  const url = `${BASE_URL}/plataforma/ingresos`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.message ?? "Error obteniendo ingresos de la plataforma");
  }
  return data; // { success: true, data: rows, count }
}

export async function getTotal() {
  const url = `${BASE_URL}/total`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

export async function getCategorias() {
  const url = `${BASE_URL}/categorias`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}