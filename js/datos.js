/*
 * Goleada Sport - Capa de datos
 *
 * Es el ÚNICO archivo que sabe de dónde salen los productos y dónde se guarda el stock.
 * Hoy: lee data/productos.js y guarda el stock vendido en localStorage del navegador.
 * Mañana: se reemplazan estas funciones por llamadas a una API (PHP + MySQL, Node, etc.)
 * y el catálogo, el carrito y el chatbot siguen funcionando igual.
 */
const Datos = (() => {
  const CLAVE_STOCK = "goleada_stock";
  let cache = null;

  const CATEGORIAS = {
    "calzado-futbol":           { nombre: "Calzado de fútbol",           deporte: "futbol" },
    "equipamiento-futbol":      { nombre: "Equipamiento de fútbol",      deporte: "futbol" },
    "calzado-running":          { nombre: "Calzado de running",          deporte: "running" },
    "ropa-accesorios-running":  { nombre: "Ropa y accesorios de running", deporte: "running" }
  };
  const DEPORTES = { futbol: "Fútbol", running: "Running" };

  function leerStockGuardado() {
    try { return JSON.parse(localStorage.getItem(CLAVE_STOCK)) || {}; }
    catch (e) { return {}; }
  }
  function guardarStock(mapa) {
    try { localStorage.setItem(CLAVE_STOCK, JSON.stringify(mapa)); } catch (e) { /* sin almacenamiento */ }
  }

  /** Carga el catálogo y aplica el stock que ya se vendió en esta sesión de demo. */
  async function iniciar() {
    if (cache) return cache;
    const base = window.GOLEADA_PRODUCTOS || [];
    const guardado = leerStockGuardado();
    cache = base.map(p => ({ ...p, stock: { ...(guardado[p.id] || p.stock) } }));
    return cache;
  }

  const productos = () => cache || [];
  const porId = id => productos().find(p => p.id === Number(id));
  const porSlug = slug => productos().find(p => p.slug === slug);
  const destacados = () => productos().filter(p => p.destacado);
  const nombreCategoria = slug => (CATEGORIAS[slug] || {}).nombre || slug;

  const tallasDe = p => Object.keys(p.stock).filter(t => t !== "unica");
  const llevaTalla = p => tallasDe(p).length > 0;
  const claveTalla = (p, talla) => (llevaTalla(p) ? String(talla) : "unica");
  const stockTalla = (p, talla) => Number(p.stock[claveTalla(p, talla)] || 0);
  const stockTotal = p => Object.values(p.stock).reduce((a, b) => a + Number(b), 0);

  /** Estado de disponibilidad para mostrar en el catálogo. */
  function estado(p) {
    const total = stockTotal(p);
    if (total <= 0)  return { clave: "agotado",    texto: "Agotado" };
    if (total <= 8)  return { clave: "ultimas",    texto: "Últimas " + total + " unidades" };
    return { clave: "disponible", texto: "Disponible" };
  }

  /** Descuenta el stock de una compra simulada. items: [{id, talla, cantidad}] */
  function descontarStock(items) {
    const guardado = leerStockGuardado();
    items.forEach(it => {
      const p = porId(it.id);
      if (!p) return;
      const k = claveTalla(p, it.talla);
      p.stock[k] = Math.max(0, Number(p.stock[k] || 0) - it.cantidad);
      guardado[p.id] = { ...p.stock };
    });
    guardarStock(guardado);
  }

  /** Deja el stock como en el catálogo original (útil antes de la demostración). */
  function reiniciarStock() {
    try { localStorage.removeItem(CLAVE_STOCK); } catch (e) { /* nada */ }
    cache = null;
    return iniciar();
  }

  const formatoPrecio = n =>
    "L " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** Escapa texto antes de ponerlo en el HTML (evita inyectar código). */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  return {
    CATEGORIAS, DEPORTES, iniciar, productos, porId, porSlug, destacados, nombreCategoria,
    tallasDe, llevaTalla, claveTalla, stockTalla, stockTotal, estado,
    descontarStock, reiniciarStock, formatoPrecio, esc
  };
})();
