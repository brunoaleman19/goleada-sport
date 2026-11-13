/*
 * Goleada Sport - Carrito de compras
 * Guarda solo { id, talla, cantidad } en localStorage; los precios y el stock
 * siempre se leen del catálogo (Datos), así no se pueden alterar desde el navegador.
 * Un mismo producto en dos tallas distintas son dos líneas separadas.
 */
const Carrito = (() => {
  const CLAVE = "goleada_carrito";

  function leer() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE));
      return Array.isArray(datos) ? datos : [];
    } catch (e) { return []; }
  }
  function guardar(lineas) {
    try { localStorage.setItem(CLAVE, JSON.stringify(lineas)); } catch (e) { /* sin almacenamiento */ }
    window.dispatchEvent(new CustomEvent("carrito:cambio"));
  }
  const buscar = (lineas, id, talla) =>
    lineas.find(l => l.id === Number(id) && String(l.talla) === String(talla));

  /** Agrega unidades. Devuelve { ok, mensaje }. */
  function agregar(id, talla, cantidad = 1) {
    const p = Datos.porId(id);
    if (!p) return { ok: false, mensaje: "No encontramos ese producto." };
    const t = Datos.llevaTalla(p) ? String(talla || "") : "unica";
    if (Datos.llevaTalla(p) && !Datos.tallasDe(p).includes(t))
      return { ok: false, mensaje: "Elige una talla antes de agregar." };
    const disponible = Datos.stockTalla(p, t);
    if (disponible <= 0) return { ok: false, mensaje: "Esa talla está agotada." };

    const lineas = leer();
    const linea = buscar(lineas, p.id, t);
    const yaEnCarrito = linea ? linea.cantidad : 0;
    if (yaEnCarrito + cantidad > disponible)
      return { ok: false, mensaje: "Solo quedan " + disponible + " unidades en esa talla." };

    if (linea) linea.cantidad += cantidad;
    else lineas.push({ id: p.id, talla: t, cantidad });
    guardar(lineas);
    return { ok: true, mensaje: "Agregado al carrito." };
  }

  /** Cambia la cantidad de una línea (entre 1 y el stock disponible). */
  function actualizar(id, talla, cantidad) {
    const p = Datos.porId(id);
    const lineas = leer();
    const linea = buscar(lineas, id, talla);
    if (!p || !linea) return { ok: false, mensaje: "No encontramos esa línea." };
    const maximo = Datos.stockTalla(p, talla);
    const n = Math.floor(Number(cantidad));
    if (!Number.isFinite(n) || n < 1) { linea.cantidad = 1; guardar(lineas); return { ok: false, mensaje: "La cantidad mínima es 1." }; }
    if (n > maximo) { linea.cantidad = maximo; guardar(lineas); return { ok: false, mensaje: "Solo quedan " + maximo + " unidades." }; }
    linea.cantidad = n;
    guardar(lineas);
    return { ok: true, mensaje: "Cantidad actualizada." };
  }

  function quitar(id, talla) {
    guardar(leer().filter(l => !(l.id === Number(id) && String(l.talla) === String(talla))));
  }
  function vaciar() { guardar([]); }

  /** Líneas con el producto, el precio y el subtotal de cada una. */
  function lineas() {
    return leer()
      .map(l => {
        const p = Datos.porId(l.id);
        if (!p) return null;
        const cantidad = Math.min(l.cantidad, Math.max(Datos.stockTalla(p, l.talla), 0));
        return { id: p.id, talla: l.talla, cantidad, producto: p, subtotal: p.precio * cantidad };
      })
      .filter(l => l && l.cantidad > 0);
  }
  const cantidadTotal = () => leer().reduce((s, l) => s + l.cantidad, 0);
  const subtotal = () => lineas().reduce((s, l) => s + l.subtotal, 0);

  return { agregar, actualizar, quitar, vaciar, lineas, cantidadTotal, subtotal };
})();
