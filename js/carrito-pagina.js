/*
 * Goleada Sport - Página del carrito
 * Cambiar cantidades, quitar productos, aplicar el cupón y ver el resumen.
 * Los precios ya incluyen ISV (15%); el resumen solo muestra cuánto es.
 */
(async () => {
  await Ui.iniciar();

  const { esc, formatoPrecio } = Datos;
  const $ = id => document.getElementById(id);
  const lineasEl = $("lineas");

  function pintar() {
    const lineas = Carrito.lineas();
    $("carrito-vacio").hidden = lineas.length > 0;
    $("carrito-contenido").hidden = lineas.length === 0;
    if (!lineas.length) return;

    lineasEl.innerHTML = lineas.map(l => {
      const p = l.producto;
      const max = Datos.stockTalla(p, l.talla);
      const talla = Datos.llevaTalla(p) ? `<p class="gs-linea__meta">Talla ${esc(l.talla)}</p>` : "";
      const k = `data-id="${p.id}" data-talla="${esc(l.talla)}"`;
      return `
      <li class="gs-linea">
        <a class="gs-linea__foto" href="producto.html?p=${encodeURIComponent(p.slug)}">
          <img src="${esc(p.imagen)}" alt="" width="120" height="120" loading="lazy">
        </a>
        <div class="gs-linea__info">
          <h2 class="gs-linea__nombre"><a href="producto.html?p=${encodeURIComponent(p.slug)}">${esc(p.nombre)}</a></h2>
          ${talla}
          <p class="gs-linea__meta">${formatoPrecio(p.precio)} c/u</p>
          <button type="button" class="gs-enlace gs-enlace--boton" data-quitar ${k}>Quitar<span class="visually-hidden"> ${esc(p.nombre)} del carrito</span></button>
        </div>
        <div class="gs-cantidad gs-cantidad--chica">
          <button type="button" data-menos ${k} aria-label="Disminuir cantidad de ${esc(p.nombre)}">−</button>
          <input type="number" value="${l.cantidad}" min="1" max="${max}" inputmode="numeric" data-cantidad ${k} aria-label="Cantidad de ${esc(p.nombre)}">
          <button type="button" data-mas ${k} aria-label="Aumentar cantidad de ${esc(p.nombre)}">+</button>
        </div>
        <p class="gs-linea__subtotal">${formatoPrecio(l.subtotal)}</p>
      </li>`;
    }).join("");

    const r = Carrito.resumen();
    const fila = (txt, val, clase = "") => `<div class="gs-totales__fila ${clase}"><dt>${txt}</dt><dd>${val}</dd></div>`;
    $("totales").innerHTML =
      fila("Subtotal", formatoPrecio(r.subtotal)) +
      (r.cupon ? fila('Descuento ' + esc(r.cupon) + ' <button type="button" class="gs-enlace gs-enlace--boton" id="quitar-cupon">Quitar</button>', "− " + formatoPrecio(r.descuento), "gs-totales__fila--desc") : "") +
      fila("Envío", r.envio ? formatoPrecio(r.envio) : "Gratis") +
      fila("Total", formatoPrecio(r.total), "gs-totales__fila--total") +
      fila("Incluye ISV (15%)", formatoPrecio(r.isv), "gs-totales__fila--isv");

    $("envio-barra").textContent = r.faltaParaEnvioGratis
      ? "Te faltan " + formatoPrecio(r.faltaParaEnvioGratis) + " para tener envío gratis."
      : "Tu pedido tiene envío gratis.";
    $("envio-barra").className = "gs-envio-barra" + (r.faltaParaEnvioGratis ? "" : " gs-envio-barra--ok");
    if (r.cupon && !$("msg-cupon").textContent) { $("codigo").value = ""; }
  }

  const decir = (txt, ok) => { const m = $("msg-cupon"); m.textContent = txt; m.className = "gs-cupon__msg gs-cupon__msg--" + (ok ? "ok" : "error"); };
  const avisarSi = r => { if (!r.ok) Ui.aviso(r.mensaje, "error"); };
  const clave = el => ({ id: el.dataset.id, talla: el.dataset.talla });
  const cantidadDe = el => { const { id, talla } = clave(el); const l = Carrito.lineas().find(x => String(x.id) === id && String(x.talla) === talla); return l ? l.cantidad : 1; };

  lineasEl.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const { id, talla } = clave(b);
    if (b.hasAttribute("data-quitar")) { Carrito.quitar(id, talla); Ui.aviso("Producto quitado del carrito.", "ok"); }
    else if (b.hasAttribute("data-menos")) { const n = cantidadDe(b); if (n > 1) avisarSi(Carrito.actualizar(id, talla, n - 1)); }
    else if (b.hasAttribute("data-mas")) avisarSi(Carrito.actualizar(id, talla, cantidadDe(b) + 1));
  });
  lineasEl.addEventListener("change", e => {
    if (e.target.hasAttribute("data-cantidad")) { const { id, talla } = clave(e.target); avisarSi(Carrito.actualizar(id, talla, e.target.value)); pintar(); }
  });

  $("vaciar").addEventListener("click", () => {
    if (confirm("¿Quieres quitar todos los productos del carrito?")) { Carrito.vaciar(); Carrito.quitarCupon(); }
  });
  $("totales").addEventListener("click", e => { if (e.target.id === "quitar-cupon") { Carrito.quitarCupon(); decir("", true); } });
  $("form-cupon").addEventListener("submit", e => {
    e.preventDefault();
    const r = Carrito.aplicarCupon($("codigo").value);
    decir(r.mensaje, r.ok);
    if (r.ok) $("codigo").value = "";
  });

  window.addEventListener("carrito:cambio", pintar);
  pintar();
})();
