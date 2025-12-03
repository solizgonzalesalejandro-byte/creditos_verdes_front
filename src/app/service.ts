// cliente: services/auth.client.ts (ejemplo)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // ajusta

export async function login(nombreUser: string, contrasenia: string, roles: string[] = []) {
  const res = await fetch(`${BASE_URL}/api/login`, {
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

  const resp = await fetch(`${BASE_URL}/usuario/registrar-completo`, {
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
  cantidadUnidad: number
) {
  const data = { usuarioId, nombreCategoria, unidadMedida, titulo, descripcion, valorCredito, cantidadUnidad };

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
// GET /api/procedures?schema=mydb
export async function getStoredProcedures(schema: string = "mydb") {
  const url = `${BASE_URL}/api/procedures?schema=${encodeURIComponent(schema)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/usuarios/roles
export async function getUsuariosConRoles() {
  const url = `${BASE_URL}/api/usuarios/roles`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/impacto/por-titulo?titulo=...
export async function getImpactoPorTitulo(titulo: string) {
  if (!titulo) throw new Error("titulo es requerido");
  const url = `${BASE_URL}/api/impacto/por-titulo?titulo=${encodeURIComponent(titulo)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/publicaciones
export async function getPublicaciones() {
  const url = `${BASE_URL}/api/publicaciones`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/publicaciones/impacto/search?term=solar
export async function searchPublicacionesImpacto(term: string) {
  if (!term) throw new Error("term es requerido");
  const url = `${BASE_URL}/api/publicaciones/impacto/search?term=${encodeURIComponent(term)}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/intercambios/pendientes
export async function getIntercambiosPendientes() {
  const url = `${BASE_URL}/api/intercambios/pendientes`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/impacto/usuarios
export async function getImpactoUsuarios() {
  const url = `${BASE_URL}/api/impacto/usuarios`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/usuarios/mas-ecologicos
export async function getUsuariosMasEcologicos() {
  const url = `${BASE_URL}/api/usuarios/mas-ecologicos`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/compras/completadas
export async function getComprasCompletadas() {
  const url = `${BASE_URL}/api/compras/completadas`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/acceso?limit=200
export async function getBitacoraAcceso(limit: number = 200) {
  const url = `${BASE_URL}/api/bitacora/acceso?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/historico/consolidado?limit=200
export async function getHistoricoConsolidado(limit: number = 200) {
  const url = `${BASE_URL}/api/historico/consolidado?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/billetera/extracto?nombreUser=ale1234&limit=200
export async function getExtractoBilletera(nombreUser: string, limit: number = 200) {
  if (!nombreUser) throw new Error("nombreUser es requerido");
  const url = `${BASE_URL}/api/billetera/extracto?nombreUser=${encodeURIComponent(nombreUser)}&limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/compras/creditos
export async function getCompraCreditos() {
  const url = `${BASE_URL}/api/compras/creditos`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/intercambio?limit=200
export async function getBitacoraIntercambio(limit: number = 200) {
  const url = `${BASE_URL}/api/bitacora/intercambio?limit=${encodeURIComponent(String(limit))}`;
  const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  return resp.json(); // { success: true, data: rows, count }
}

// GET /api/bitacora/usuario?limit=200
export async function getBitacoraUsuario(limit: number = 200) {
  const url = `${BASE_URL}/api/bitacora/usuario?limit=${encodeURIComponent(String(limit))}`;
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
