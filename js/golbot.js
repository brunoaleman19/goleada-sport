/*
 * Goleada Sport - Golbot, asistente de atención al cliente
 * Chatbot BASADO EN REGLAS: no usa inteligencia artificial ni servicios externos.
 * Funciona así: normaliza lo que escribe la persona (minúsculas, sin tildes), busca palabras clave
 * y responde con textos preparados o con datos reales del catálogo (precio, stock, recomendaciones).
 * La conversación se guarda en sessionStorage para que no se pierda al cambiar de página.
 */
const Golbot = (() => {
  const { esc, formatoPrecio } = Datos;
  const CLAVE = "goleada_golbot";
  const SALUDO = "¡Hola! Soy <strong>Golbot</strong>, el asistente de Goleada Sport. Puedo ayudarte con envíos, pagos, cambios, tallas, stock y recomendaciones. ¿Qué necesitas?";
  const TEMAS = ["Envíos", "Formas de pago", "Cambios y devoluciones", "Guía de tallas", "Recomiéndame algo", "Código de descuento"];
  let estado = { abierto: false, msgs: [], pendiente: "" };
  let el = {};

  /* ---------- Utilidades ---------- */
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ$.,\s-]/g, " ").replace(/\s+/g, " ").trim();
  const enlaceProducto = p => `<a href="producto.html?p=${encodeURIComponent(p.slug)}">${esc(p.nombre)}</a>`;
  const enlaceCategoria = (slug, texto) => `<a href="catalogo.html?categoria=${slug}">${esc(texto)}</a>`;
  const CONTACTO = `<a href="contacto.html">página de contacto</a>`;

  /* ---------- Productos: detección por nombre ---------- */
  const PALABRAS_VACIAS = new Set(["de", "la", "el", "pro", "ml", "n5", "n°5", "deportivo", "deportiva", "futbol", "sala", "zapatos", "tenis", "botines", "fit"]);
  function productoMencionado(t) {
    const palabras = new Set(t.split(" "));
    const prods = Datos.productos();
    const fichas = prods.map(p => ({ p, tokens: norm(p.nombre).split(" ").filter(w => w.length > 2 && !PALABRAS_VACIAS.has(w)) }));
    const frecuencia = {};
    fichas.forEach(f => new Set(f.tokens).forEach(w => { frecuencia[w] = (frecuencia[w] || 0) + 1; }));
    let mejor = null, puntos = 0;
    fichas.forEach(f => {
      const n = f.tokens.filter(w => frecuencia[w] === 1 && palabras.has(w)).length;
      if (n > puntos) { puntos = n; mejor = f.p; }
    });
    if (!mejor) {
      const q = prods.find(p => t.includes(norm(p.nombre)));
      if (q) return q;
    }
    return mejor;
  }

  /* ---------- Categorías y deportes ---------- */
  const CAT_REGLAS = [
    ["calzado-futbol", /(botines|tacos|guayos|zapatos de futbol|futbol sala|indoor)/],
    ["calzado-running", /(tenis|zapatillas|correr|zapatos de running|running shoes|trail)/],
    ["equipamiento-futbol", /(balon|pelota|espinillera|canillera|guante|portero|equipamiento)/],
    ["ropa-accesorios-running", /(camiseta|playera|camisa|short|botella|ropa|accesorio)/]
  ];
  const categoriaMencionada = t => { const r = CAT_REGLAS.find(([, re]) => re.test(t)); return r ? r[0] : ""; };
  const deporteMencionado = t => /\b(futbol|soccer|cancha)\b/.test(t) ? "futbol" : /\b(running|correr|corro|trotar|maraton|atletismo)\b/.test(t) ? "running" : "";
  function presupuesto(t) {
    const m = /(?:menos de|hasta|maximo|max|no mas de|por|con)?\s*(?:l|lps?|lempiras?|\$)?\s*(\d{1,3}(?:[.,]\d{3})+|\d{3,5})\s*(?:lps?|lempiras?)?/.exec(t);
    if (!m) return null;
    const n = Number(m[1].replace(/[.,](?=\d{3})/g, ""));
    return n >= 100 ? n : null;
  }

  /* ---------- Respuestas ---------- */
  function respuestaProducto(p, enfoque) {
    const est = Datos.estado(p);
    const cab = `<strong>${enlaceProducto(p)}</strong>: ${formatoPrecio(p.precio)}.`;
    if (enfoque === "precio") return { html: `${cab} Los precios ya incluyen ISV.`, chips: ["Guía de tallas", "Envíos"] };
    if (Datos.llevaTalla(p)) {
      const lista = Datos.tallasDe(p).map(t => {
        const n = Datos.stockTalla(p, t);
        return `Talla ${esc(t)}: ${n > 0 ? n + (n === 1 ? " unidad" : " unidades") : "agotada"}`;
      }).join("<br>");
      return { html: `${cab}<br>${esc(est.texto)}.<br><br>${lista}<br><br>Elige tu talla en la página del producto.`, chips: ["Guía de tallas", "Envíos"] };
    }
    return { html: `${cab}<br>${esc(est.texto)}${est.clave === "agotado" ? "" : ". Quedan " + Datos.stockTotal(p) + " unidades"}.`, chips: ["Envíos", "Recomiéndame algo"] };
  }

  function recomendar(t) {
    const cat = categoriaMencionada(t), dep = deporteMencionado(t) || (cat ? Datos.CATEGORIAS[cat].deporte : ""), tope = presupuesto(t);
    if (!cat && !dep && !tope) {
      estado.pendiente = "deporte";
      return { html: "¡Claro! ¿Para qué deporte buscas?", chips: ["Fútbol", "Running"] };
    }
    let lista = Datos.productos().filter(p => Datos.stockTotal(p) > 0)
      .filter(p => !cat || p.categoria === cat)
      .filter(p => !dep || Datos.CATEGORIAS[p.categoria].deporte === dep)
      .filter(p => !tope || p.precio <= tope);
    lista.sort((a, b) => (b.destacado - a.destacado) || (a.precio - b.precio));
    const donde = cat ? Datos.nombreCategoria(cat).toLowerCase() : dep ? Datos.DEPORTES[dep].toLowerCase() : "nuestro catálogo";
    if (!lista.length) {
      return { html: `No encontré productos de ${esc(donde)}${tope ? " hasta " + formatoPrecio(tope) : ""} con stock. Prueba con otro presupuesto o mira el <a href="catalogo.html">catálogo completo</a>.`, chips: ["Fútbol", "Running"] };
    }
    const top = lista.slice(0, 3);
    const items = top.map(p => `• ${enlaceProducto(p)} – ${formatoPrecio(p.precio)}`).join("<br>");
    const enlace = cat ? `<br><br>Mira más en ${enlaceCategoria(cat, Datos.nombreCategoria(cat))}.` : dep ? `<br><br>Mira más en <a href="catalogo.html?deporte=${dep}">${esc(Datos.DEPORTES[dep])}</a>.` : "";
    return { html: `Te recomiendo estas opciones de ${esc(donde)}${tope ? " hasta " + formatoPrecio(tope) : ""}:<br>${items}${enlace}`, chips: ["Envíos", "Guía de tallas"] };
  }

  function respuestaTallas(t) {
    const tabla = (titulo, filas) => `<strong>${titulo}</strong><br>${filas.join("<br>")}`;
    const calzado = tabla("Calzado (largo del pie)", ["7: 25 cm (EU 40)", "8: 26 cm (EU 41)", "9: 27 cm (EU 42)", "10: 28 cm (EU 43)"]);
    const ropa = tabla("Camisetas y shorts (pecho)", ["S: 88 a 94 cm", "M: 95 a 101 cm", "G: 102 a 108 cm", "XG: 109 a 115 cm"]);
    const guantes = tabla("Guantes de portero (mano)", ["7: 17.8 cm", "8: 20.3 cm", "9: 22.9 cm", "10: 25.4 cm"]);
    if (/(guante|portero)/.test(t)) return { html: guantes + "<br><br>Mide alrededor de la palma, sin contar el pulgar.", chips: ["Cambios y devoluciones"] };
    if (/(camiseta|playera|short|ropa|camisa)/.test(t)) return { html: ropa + "<br><br>Mide la parte más ancha del pecho. Las medidas son aproximadas.", chips: ["Cambios y devoluciones"] };
    if (/(botin|tenis|zapato|calzado|pie|zapatilla)/.test(t)) return { html: calzado + "<br><br>Apoya el pie en una hoja y mide del talón al dedo más largo. Si estás entre dos tallas, elige la mayor.", chips: ["Cambios y devoluciones"] };
    return { html: calzado + "<br><br>" + ropa + "<br><br>" + guantes + "<br><br>Las medidas son aproximadas. Si estás entre dos tallas, elige la mayor.", chips: ["Cambios y devoluciones", "Recomiéndame algo"] };
  }

  function respuestaCarrito() {
    const lineas = Carrito.lineas();
    if (!lineas.length) return { html: `Tu carrito está vacío. Mira el <a href="catalogo.html">catálogo</a> y agrega lo que te guste.`, chips: ["Recomiéndame algo"] };
    const r = Carrito.resumen();
    const items = lineas.map(l => `• ${esc(l.producto.nombre)}${Datos.llevaTalla(l.producto) ? " (talla " + esc(l.talla) + ")" : ""} × ${l.cantidad}`).join("<br>");
    const envio = r.envio ? "Envío: " + formatoPrecio(r.envio) + " (te faltan " + formatoPrecio(r.faltaParaEnvioGratis) + " para envío gratis)" : "Envío gratis";
    return { html: `En tu carrito tienes:<br>${items}<br><br>Subtotal: ${formatoPrecio(r.subtotal)}<br>${envio}<br><strong>Total: ${formatoPrecio(r.total)}</strong><br><br><a href="carrito.html">Ver carrito</a> · <a href="checkout.html">Finalizar compra</a>`, chips: ["Código de descuento", "Formas de pago"] };
  }

  const TEMAS_FIJOS = [
    ["envio", /(envio|enviar|enviarlo|entrega|entregan|domicilio|delivery|cuanto tarda|cuando llega|despacho|flete|costo de envio)/, () => ({
      html: "Enviamos a <strong>todo Honduras</strong> en 2 a 5 días hábiles.<br>El envío cuesta <strong>L 150</strong> y es <strong>gratis desde L 2,000</strong> de compra.",
      chips: ["Formas de pago", "Cambios y devoluciones"] })],
    ["pago", /(pago|pagar|tarjeta|efectivo|transferencia|contra entrega|visa|mastercard|metodo|deposito)/, () => ({
      html: "Por ahora aceptamos <strong>pago con tarjeta</strong>. En esta tienda de demostración el pago es simulado: no se cobra nada y los datos de la tarjeta no se guardan.<br>Los precios ya incluyen el ISV (15%).",
      chips: ["Envíos", "Código de descuento"] })],
    ["cambio", /(cambio|cambiar|devolucion|devolver|garantia|reembolso|defecto|defectuoso|no me queda|no me sirve|no me quedo)/, () => ({
      html: "Tienes <strong>15 días</strong> para pedir un cambio si la talla no te queda o si el producto llega con defectos. El producto debe estar sin uso y en su empaque original.<br>Escríbenos desde la " + CONTACTO + " para gestionarlo.",
      chips: ["Guía de tallas", "Envíos"] })],
    ["talla", /(talla|tallas|medida|medidas|numero de calzado|que talla|cual talla|guia de talla|me quedara)/, t => respuestaTallas(t)],
    ["cupon", /(cupon|descuento|codigo|promocion|promociones|promo|oferta|rebaja|goleada10)/, () => ({
      html: "Tu <strong>primera compra</strong> tiene <strong>10% de descuento</strong> con el código <strong>GOLEADA10</strong>. Escríbelo en tu <a href=\"carrito.html\">carrito</a>, en el campo de código de descuento.<br>También puedes suscribirte al boletín en el <a href=\"index.html#suscripcion\">inicio</a> para recibir ofertas.",
      chips: ["Envíos", "Recomiéndame algo"] })],
    ["isv", /(isv|impuesto|impuestos|factura|iva)/, () => ({
      html: "Todos los precios están en lempiras e <strong>incluyen el ISV (15%)</strong>. En tu carrito verás cuánto del total corresponde al impuesto.",
      chips: ["Envíos", "Formas de pago"] })],
    ["contacto", /(contacto|contactar|telefono|llamar|whatsapp|correo|email|horario|ubicacion|direccion|donde estan|tienda fisica|atencion|hablar con|asesor|persona)/, () => ({
      html: "Puedes escribirnos desde la " + CONTACTO + " o por:<br>Correo: <a href=\"mailto:contacto@goleadasport.hn\">contacto@goleadasport.hn</a><br>Teléfono: <a href=\"tel:+50425550000\">+504 2555-0000</a><br>Horario: lunes a viernes de 8:00 a. m. a 5:00 p. m. y sábados de 8:00 a. m. a 12:00 m.<br>Estamos en San Pedro Sula, Honduras.",
      chips: ["Envíos", "Cambios y devoluciones"] })]
  ];

  const MENU = () => ({ html: "Puedo ayudarte con estos temas. Elige uno o escríbeme tu pregunta:", chips: TEMAS });
  const NO_ENTIENDO = () => ({
    html: "No estoy seguro de haber entendido. Prueba con uno de estos temas o escribe el nombre de un producto, por ejemplo <em>“¿cuánto cuesta el balón?”</em>.<br>Si prefieres hablar con una persona, usa la " + CONTACTO + ".",
    chips: TEMAS
  });

  /* ---------- Cerebro: decide qué responder ---------- */
  function responder(texto) {
    const t = norm(texto);
    if (!t) return NO_ENTIENDO();

    // Respuesta corta a una pregunta de Golbot ("¿para qué deporte?")
    if (estado.pendiente === "deporte") {
      estado.pendiente = "";
      const dep = deporteMencionado(t);
      if (dep) return recomendar(dep);
    }
    estado.pendiente = "";

    if (/(mi carrito|en el carrito|mi pedido|cuanto debo|cuanto llevo|mi compra|que llevo)/.test(t)) return respuestaCarrito();

    const prod = productoMencionado(t);
    const pideStock = /(stock|quedan|queda|disponible|disponibilidad|hay |existencia|agotado|inventario|tienen|tallas)/.test(t);
    const pidePrecio = /(cuesta|precio|vale|costo|cuanto sale|cuanto es|cuanto)/.test(t);
    if (/(guia|medida|medidas|medir|como medir)/.test(t) && /(talla|medida|medir)/.test(t)) return respuestaTallas(t);
    if (prod && (pideStock || pidePrecio)) return respuestaProducto(prod, pidePrecio && !pideStock ? "precio" : "stock");

    for (const [, re, fn] of TEMAS_FIJOS) if (re.test(t)) return fn(t);

    if (prod) return respuestaProducto(prod, "stock");

    if (/(recomiend|recomend|sugier|sugerencia|que me conviene|busco|quiero comprar|necesito|que producto|barato|economico|algo para|zapatos|calzado)/.test(t) || categoriaMencionada(t) || deporteMencionado(t) || presupuesto(t))
      return recomendar(t);

    if (/(quien eres|como te llamas|que eres|que puedes hacer|que haces|ayuda|ayudame|menu|opciones)/.test(t)) return MENU();
    if (/\b(gracias|muchas gracias|thanks|genial|perfecto|excelente|listo)\b/.test(t)) return { html: "¡Con gusto! Si necesitas algo más, aquí estoy. ¡Que tengas una goleada de compra!", chips: ["Recomiéndame algo", "Envíos"] };
    if (/\b(adios|chao|chau|hasta luego|nos vemos|bye)\b/.test(t)) return { html: "¡Hasta pronto! Gracias por visitar Goleada Sport.", chips: [] };
    if (/\b(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal)\b/.test(t)) return { html: SALUDO, chips: TEMAS };
    return NO_ENTIENDO();
  }

  /* ---------- Interfaz ---------- */
  function guardar() { try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }
  function cargar() {
    try { const s = JSON.parse(sessionStorage.getItem(CLAVE)); if (s && Array.isArray(s.msgs)) estado = { abierto: !!s.abierto, msgs: s.msgs.slice(-40), pendiente: s.pendiente || "" }; } catch (e) { /* nuevo */ }
  }

  function pintar() {
    const ultimoBot = estado.msgs.map(m => m.de).lastIndexOf("bot");
    el.log.innerHTML = estado.msgs.map((m, i) => `
      <div class="gs-bot__msg gs-bot__msg--${m.de}">
        <p>${m.html}</p>
        ${m.de === "bot" && i === ultimoBot && m.chips && m.chips.length
          ? `<div class="gs-bot__chips">${m.chips.map(c => `<button type="button" class="gs-bot__chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : ""}
      </div>`).join("");
    el.log.scrollTop = el.log.scrollHeight;
  }

  function agregar(de, html, chips) {
    estado.msgs.push({ de, html, chips: chips || [] });
    if (estado.msgs.length > 40) estado.msgs.shift();
    guardar(); pintar();
  }

  let escribiendo = false;
  function enviar(texto) {
    texto = String(texto).trim().slice(0, 200);
    if (!texto || escribiendo) return;
    agregar("yo", esc(texto));
    escribiendo = true;
    el.estado.textContent = "Golbot está escribiendo…";
    setTimeout(() => {
      const r = responder(texto);
      escribiendo = false;
      el.estado.textContent = "";
      agregar("bot", r.html, r.chips);
    }, 450);
  }

  function abrir(abierto, enfocar = true) {
    estado.abierto = abierto;
    el.panel.hidden = !abierto;
    el.boton.setAttribute("aria-expanded", String(abierto));
    el.boton.classList.toggle("gs-bot__boton--abierto", abierto);
    if (abierto) {
      if (!estado.msgs.length) agregar("bot", SALUDO, TEMAS); else pintar();
      if (enfocar) el.entrada.focus();
    } else if (enfocar) el.boton.focus();
    guardar();
  }

  function iniciar() {
    if (document.getElementById("golbot")) return;
    cargar();
    const raiz = document.createElement("div");
    raiz.id = "golbot";
    raiz.className = "gs-bot";
    raiz.innerHTML = `
      <section class="gs-bot__panel" id="golbot-panel" role="dialog" aria-label="Golbot, asistente de Goleada Sport" hidden>
        <header class="gs-bot__cabecera">
          <div><strong>Golbot</strong><span>Asistente de Goleada Sport</span></div>
          <button type="button" class="gs-bot__cerrar" id="golbot-cerrar" aria-label="Cerrar el chat">×</button>
        </header>
        <div class="gs-bot__log" id="golbot-log" role="log" aria-live="polite" aria-label="Conversación con Golbot"></div>
        <p class="gs-bot__estado" id="golbot-estado" aria-live="polite"></p>
        <form class="gs-bot__form" id="golbot-form" autocomplete="off">
          <label class="visually-hidden" for="golbot-entrada">Escribe tu pregunta</label>
          <input type="text" id="golbot-entrada" maxlength="200" placeholder="Escribe tu pregunta…">
          <button type="submit" class="gs-btn gs-btn--verde">Enviar</button>
        </form>
      </section>
      <button type="button" class="gs-bot__boton" id="golbot-boton" aria-label="Abrir el chat con Golbot" aria-expanded="false" aria-controls="golbot-panel">
        ${Ui.ICONOS.chat}<span>Golbot</span>
      </button>`;
    document.body.appendChild(raiz);
    el = { panel: $("golbot-panel"), log: $("golbot-log"), estado: $("golbot-estado"), entrada: $("golbot-entrada"), boton: $("golbot-boton") };

    el.boton.addEventListener("click", () => abrir(el.panel.hidden));
    $("golbot-cerrar").addEventListener("click", () => abrir(false));
    $("golbot-form").addEventListener("submit", e => { e.preventDefault(); const v = el.entrada.value; el.entrada.value = ""; enviar(v); });
    el.log.addEventListener("click", e => { const b = e.target.closest("[data-chip]"); if (b) enviar(b.dataset.chip); });
    raiz.addEventListener("keydown", e => { if (e.key === "Escape" && !el.panel.hidden) abrir(false); });

    if (estado.abierto) abrir(true, false);
  }
  function $(id) { return document.getElementById(id); }

  return { iniciar, responder: texto => responder(texto) };
})();
