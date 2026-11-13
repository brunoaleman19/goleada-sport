/*
 * Goleada Sport - Catálogo
 * Filtros por deporte, categoría, precio y disponibilidad, búsqueda y orden.
 * El estado de los filtros vive en la URL (catalogo.html?deporte=futbol&orden=precio-asc),
 * así se puede compartir o volver atrás sin perder lo que se eligió.
 */
(async () => {
  await Ui.iniciar();

  const $ = id => document.getElementById(id);
  const lista = $("lista"), vacio = $("vacio"), conteo = $("conteo"), etiquetas = $("etiquetas");
  const ORDENES = ["relevancia", "precio-asc", "precio-desc", "nombre"];
  const normalizar = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const numero = v => { const n = parseFloat(v); return Number.isFinite(n) && n >= 0 ? n : null; };

  /* ---------- Estado inicial desde la URL ---------- */
  const url = new URLSearchParams(location.search);
  const estado = {
    deporte: Datos.DEPORTES[url.get("deporte")] ? url.get("deporte") : "",
    categoria: Datos.CATEGORIAS[url.get("categoria")] ? url.get("categoria") : "",
    q: (url.get("q") || "").trim().slice(0, 60),
    orden: ORDENES.includes(url.get("orden")) ? url.get("orden") : "relevancia",
    disp: url.get("disp") === "1",
    min: numero(url.get("min")),
    max: numero(url.get("max"))
  };
  if (estado.categoria) estado.deporte = Datos.CATEGORIAS[estado.categoria].deporte;

  /* ---------- Acceso rápido a categorías ---------- */
  function pintarCategorias() {
    const slugs = Object.keys(Datos.CATEGORIAS).filter(s => !estado.deporte || Datos.CATEGORIAS[s].deporte === estado.deporte);
    const boton = (slug, texto) =>
      `<button type="button" class="gs-chip" data-categoria="${slug}" aria-pressed="${estado.categoria === slug}">${Datos.esc(texto)}</button>`;
    $("categorias").innerHTML = boton("", "Todas") + slugs.map(s => boton(s, Datos.CATEGORIAS[s].nombre)).join("");
  }

  /* ---------- Sincroniza los controles con el estado ---------- */
  function pintarControles() {
    document.querySelectorAll('input[name="deporte"]').forEach(r => { r.checked = r.value === estado.deporte; });
    $("buscar").value = estado.q;
    $("orden").value = estado.orden;
    $("solo-disponibles").checked = estado.disp;
    $("precio-min").value = estado.min ?? "";
    $("precio-max").value = estado.max ?? "";
  }

  /* ---------- Filtrar y ordenar ---------- */
  function resultado() {
    let min = estado.min, max = estado.max;
    const rangoInvalido = min !== null && max !== null && min > max;
    if (rangoInvalido) { min = null; max = null; }
    $("msg-precio").textContent = rangoInvalido ? "El precio mínimo no puede ser mayor que el máximo." : "";

    const q = normalizar(estado.q);
    let items = Datos.productos().filter(p => {
      if (estado.deporte && Datos.CATEGORIAS[p.categoria].deporte !== estado.deporte) return false;
      if (estado.categoria && p.categoria !== estado.categoria) return false;
      if (estado.disp && Datos.stockTotal(p) <= 0) return false;
      if (min !== null && p.precio < min) return false;
      if (max !== null && p.precio > max) return false;
      if (q && !normalizar(p.nombre + " " + p.descripcion + " " + Datos.nombreCategoria(p.categoria)).includes(q)) return false;
      return true;
    });
    const por = {
      "relevancia":  (a, b) => (b.destacado - a.destacado) || (a.id - b.id),
      "precio-asc":  (a, b) => a.precio - b.precio,
      "precio-desc": (a, b) => b.precio - a.precio,
      "nombre":      (a, b) => a.nombre.localeCompare(b.nombre, "es")
    };
    return items.sort(por[estado.orden]);
  }

  /* ---------- Etiquetas de filtros activos ---------- */
  function pintarEtiquetas() {
    const t = [];
    if (estado.q) t.push(["q", "Búsqueda: “" + estado.q + "”"]);
    if (estado.min !== null) t.push(["min", "Desde " + Datos.formatoPrecio(estado.min)]);
    if (estado.max !== null) t.push(["max", "Hasta " + Datos.formatoPrecio(estado.max)]);
    if (estado.disp) t.push(["disp", "Solo disponibles"]);
    etiquetas.innerHTML = t.map(([k, txt]) =>
      `<button type="button" class="gs-etiqueta" data-quitar="${k}">${Datos.esc(txt)} <span aria-hidden="true">×</span><span class="visually-hidden">Quitar este filtro</span></button>`).join("");
  }

  /* ---------- Título, URL y lista ---------- */
  function actualizar() {
    const items = resultado();
    const titulo = estado.categoria ? Datos.nombreCategoria(estado.categoria)
                 : estado.deporte ? Datos.DEPORTES[estado.deporte] : "Catálogo";
    $("titulo-catalogo").textContent = titulo;
    document.title = (titulo === "Catálogo" ? "Catálogo de fútbol y running" : titulo) + " | Goleada Sport";

    const total = Datos.productos().length;
    conteo.textContent = items.length === 1 ? "Mostrando 1 producto" : "Mostrando " + items.length + " de " + total + " productos";
    lista.innerHTML = items.map(p => `<div class="col">${Ui.tarjeta(p, true)}</div>`).join("");
    vacio.hidden = items.length > 0;

    pintarCategorias();
    pintarEtiquetas();

    const params = new URLSearchParams();
    if (estado.deporte) params.set("deporte", estado.deporte);
    if (estado.categoria) params.set("categoria", estado.categoria);
    if (estado.q) params.set("q", estado.q);
    if (estado.orden !== "relevancia") params.set("orden", estado.orden);
    if (estado.disp) params.set("disp", "1");
    if (estado.min !== null) params.set("min", estado.min);
    if (estado.max !== null) params.set("max", estado.max);
    try { history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : "")); } catch (e) { /* abierto como archivo */ }
  }

  /* ---------- Eventos ---------- */
  const retraso = (fn, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  document.querySelectorAll('input[name="deporte"]').forEach(r => r.addEventListener("change", () => {
    estado.deporte = r.value;
    if (estado.categoria && estado.deporte && Datos.CATEGORIAS[estado.categoria].deporte !== estado.deporte) estado.categoria = "";
    actualizar();
  }));
  $("categorias").addEventListener("click", e => {
    const b = e.target.closest("[data-categoria]");
    if (!b) return;
    estado.categoria = b.dataset.categoria;
    if (estado.categoria) { estado.deporte = Datos.CATEGORIAS[estado.categoria].deporte; pintarControles(); }
    actualizar();
  });
  $("buscar").addEventListener("input", retraso(e => { estado.q = e.target.value.trim().slice(0, 60); actualizar(); }));
  $("orden").addEventListener("change", e => { estado.orden = e.target.value; actualizar(); });
  $("solo-disponibles").addEventListener("change", e => { estado.disp = e.target.checked; actualizar(); });
  $("precio-min").addEventListener("input", retraso(e => { estado.min = numero(e.target.value); actualizar(); }, 400));
  $("precio-max").addEventListener("input", retraso(e => { estado.max = numero(e.target.value); actualizar(); }, 400));

  etiquetas.addEventListener("click", e => {
    const b = e.target.closest("[data-quitar]");
    if (!b) return;
    const k = b.dataset.quitar;
    if (k === "q") estado.q = ""; else if (k === "disp") estado.disp = false; else estado[k] = null;
    pintarControles(); actualizar();
  });
  document.querySelectorAll("[data-limpiar]").forEach(b => b.addEventListener("click", () => {
    Object.assign(estado, { deporte: "", categoria: "", q: "", orden: "relevancia", disp: false, min: null, max: null });
    pintarControles(); actualizar();
  }));

  Ui.activarAgregar(lista);
  pintarControles();
  actualizar();
})();
