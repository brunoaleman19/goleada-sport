/*
 * Goleada Sport - Detalle de producto
 * Se abre como producto.html?p=botines-velocity-pro (el "slug" es la URL amigable del producto).
 * Elegir talla muestra cuántas unidades quedan y limita la cantidad al stock de esa talla.
 */
(async () => {
  await Ui.iniciar();

  const { esc, formatoPrecio } = Datos;
  const SITIO = "https://brunoaleman19.github.io/goleada-sport/";
  const slug = new URLSearchParams(location.search).get("p") || "";
  const p = Datos.porSlug(slug);
  const cont = document.getElementById("detalle");

  /* ---------- Producto no encontrado ---------- */
  if (!p) {
    document.title = "Producto no encontrado | Goleada Sport";
    cont.innerHTML = `
      <div class="gs-vacio">
        <h1>No encontramos ese producto</h1>
        <p>Puede que el enlace esté incompleto o que el producto ya no esté en el catálogo.</p>
        <a class="gs-btn gs-btn--verde" href="catalogo.html">Ver el catálogo</a>
      </div>`;
    return;
  }

  /* ---------- SEO de esta página ---------- */
  const est = Datos.estado(p);
  const url = SITIO + "producto.html?p=" + encodeURIComponent(p.slug);
  const imagenAbs = SITIO + p.imagen;
  document.title = p.nombre + " | Goleada Sport";
  const fijar = (sel, attr, valor) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, valor); };
  fijar('meta[name="description"]', "content", p.nombre + ": " + p.descripcion + " " + formatoPrecio(p.precio) + ". Envíos a todo Honduras.");
  fijar('link[rel="canonical"]', "href", url);
  fijar('meta[property="og:title"]', "content", p.nombre + " | Goleada Sport");
  fijar('meta[property="og:description"]', "content", p.descripcion);
  fijar('meta[property="og:image"]', "content", imagenAbs);
  const datosEstructurados = document.createElement("script");
  datosEstructurados.type = "application/ld+json";
  datosEstructurados.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name: p.nombre, image: imagenAbs, description: p.descripcion,
    category: Datos.nombreCategoria(p.categoria), brand: { "@type": "Brand", name: "Goleada Sport" },
    offers: { "@type": "Offer", url, priceCurrency: "HNL", price: p.precio,
      availability: est.clave === "agotado" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }
  });
  document.head.appendChild(datosEstructurados);

  /* ---------- Migas de pan ---------- */
  document.getElementById("migas").innerHTML = `
    <ol>
      <li><a href="index.html">Inicio</a></li>
      <li><a href="catalogo.html">Catálogo</a></li>
      <li><a href="catalogo.html?categoria=${esc(p.categoria)}">${esc(Datos.nombreCategoria(p.categoria))}</a></li>
      <li aria-current="page">${esc(p.nombre)}</li>
    </ol>`;

  /* ---------- Guía de tallas según el tipo de producto ---------- */
  function guiaTallas() {
    const tabla = (cabecera, filas) => `
      <table class="table table-sm gs-tabla">
        <thead><tr>${cabecera.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead>
        <tbody>${filas.map(f => `<tr><th scope="row">${f[0]}</th>${f.slice(1).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>`;
    let titulo, cuerpo;
    if (p.categoria.startsWith("calzado")) {
      titulo = "Guía de tallas de calzado";
      cuerpo = tabla(["Talla", "Largo del pie", "Equivale a (EU)"], [["7", "25 cm", "40"], ["8", "26 cm", "41"], ["9", "27 cm", "42"], ["10", "28 cm", "43"]]) +
        "<p>Apoya el pie en una hoja, marca el talón y el dedo más largo, y mide la distancia. Si estás entre dos tallas, elige la mayor.</p>";
    } else if (p.slug.includes("guantes")) {
      titulo = "Guía de tallas de guantes";
      cuerpo = tabla(["Talla", "Contorno de la mano"], [["7", "17.8 cm"], ["8", "20.3 cm"], ["9", "22.9 cm"], ["10", "25.4 cm"]]) +
        "<p>Mide alrededor de la palma, justo debajo de los dedos y sin contar el pulgar.</p>";
    } else if (p.categoria === "ropa-accesorios-running") {
      titulo = "Guía de tallas de ropa";
      cuerpo = tabla(["Talla", "Contorno de pecho"], [["S", "88 a 94 cm"], ["M", "95 a 101 cm"], ["G", "102 a 108 cm"], ["XG", "109 a 115 cm"]]) +
        "<p>Mide alrededor de la parte más ancha del pecho, con la cinta pegada al cuerpo.</p>";
    } else return "";
    return `
      <div class="gs-guia">
        <button class="gs-guia__boton" type="button" data-bs-toggle="collapse" data-bs-target="#guia-tallas" aria-expanded="false" aria-controls="guia-tallas">${titulo}</button>
        <div class="collapse" id="guia-tallas"><div class="gs-guia__cuerpo">${cuerpo}<p class="gs-guia__nota">Las medidas son aproximadas.</p></div></div>
      </div>`;
  }

  /* ---------- Contenido del producto ---------- */
  const lleva = Datos.llevaTalla(p);
  const agotado = est.clave === "agotado";
  const selectorTalla = !lleva ? "" : `
    <fieldset class="gs-tallas">
      <legend>Talla</legend>
      <div class="gs-tallas__lista">
        ${Datos.tallasDe(p).map(t => {
          const hay = Datos.stockTalla(p, t) > 0;
          return `<input class="visually-hidden" type="radio" name="talla" id="talla-${esc(t)}" value="${esc(t)}"${hay ? "" : " disabled"}>
                  <label class="gs-talla" for="talla-${esc(t)}">${esc(t)}${hay ? "" : '<span class="visually-hidden"> (agotada)</span>'}</label>`;
        }).join("")}
      </div>
      <p class="gs-tallas__msg" id="msg-talla" role="status">Elige una talla para ver cuántas unidades quedan.</p>
    </fieldset>`;

  document.title = p.nombre + " | Goleada Sport";
  cont.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-md-6">
        <div class="gs-detalle__foto">
          <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" width="1000" height="1000" fetchpriority="high">
        </div>
      </div>
      <div class="col-md-6">
        <p class="gs-producto__cat"><a href="catalogo.html?categoria=${esc(p.categoria)}">${esc(Datos.nombreCategoria(p.categoria))}</a></p>
        <h1 class="gs-titulo-pagina gs-titulo-pagina--producto">${esc(p.nombre)}</h1>
        <p class="gs-detalle__precio">${formatoPrecio(p.precio)}</p>
        <p class="gs-disp gs-disp--${est.clave}"><span class="gs-disp__punto" aria-hidden="true"></span>${esc(est.texto)}</p>
        <p class="gs-detalle__desc">${esc(p.descripcion)}</p>

        <form id="form-compra" novalidate>
          ${selectorTalla}
          <div class="gs-cantidad-fila">
            <label for="cantidad">Cantidad</label>
            <div class="gs-cantidad">
              <button type="button" id="menos" aria-label="Disminuir cantidad">−</button>
              <input type="number" id="cantidad" value="1" min="1" max="${lleva ? 1 : Datos.stockTotal(p)}" inputmode="numeric">
              <button type="button" id="mas" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
          <p class="gs-detalle__msg" id="msg-compra" role="status"></p>
          <div class="gs-detalle__acciones">
            ${agotado
              ? `<span class="gs-btn gs-btn--fantasma disabled" aria-disabled="true">Agotado</span>`
              : `<button type="submit" class="gs-btn gs-btn--verde gs-btn--grande">Agregar al carrito</button>`}
            <a class="gs-btn gs-btn--borde gs-btn--grande" href="carrito.html">Ver carrito</a>
          </div>
        </form>

        <ul class="gs-detalle__datos">
          <li>Envío a todo Honduras en 2 a 5 días hábiles. Gratis desde L 2,000.</li>
          <li>${lleva ? "Cambios por 15 días si la talla no te queda." : "Cambios por 15 días si el producto llega con defectos."}</li>
          <li>Precios en lempiras (L), con impuestos incluidos.</li>
        </ul>
        ${guiaTallas()}
      </div>
    </div>`;

  /* ---------- Talla, cantidad y agregar ---------- */
  const form = document.getElementById("form-compra");
  const cantidad = document.getElementById("cantidad");
  const msgCompra = document.getElementById("msg-compra");
  const msgTalla = document.getElementById("msg-talla");
  const tallaElegida = () => { const r = form.querySelector('input[name="talla"]:checked'); return r ? r.value : null; };
  const maximo = () => lleva ? (tallaElegida() ? Datos.stockTalla(p, tallaElegida()) : 1) : Datos.stockTotal(p);

  function ajustarCantidad() {
    const max = Math.max(maximo(), 1);
    cantidad.max = max;
    const n = parseInt(cantidad.value, 10);
    cantidad.value = Number.isFinite(n) ? Math.min(Math.max(n, 1), max) : 1;
  }
  form.querySelectorAll('input[name="talla"]').forEach(r => r.addEventListener("change", () => {
    const t = r.value, n = Datos.stockTalla(p, t);
    msgTalla.textContent = n <= 5 ? "Talla " + t + ": quedan solo " + n + (n === 1 ? " unidad." : " unidades.") : "Talla " + t + ": disponible.";
    msgCompra.textContent = ""; msgCompra.className = "gs-detalle__msg";
    ajustarCantidad();
  }));
  document.getElementById("menos").addEventListener("click", () => { cantidad.value = (parseInt(cantidad.value, 10) || 1) - 1; ajustarCantidad(); });
  document.getElementById("mas").addEventListener("click", () => { cantidad.value = (parseInt(cantidad.value, 10) || 0) + 1; ajustarCantidad(); });
  cantidad.addEventListener("change", ajustarCantidad);

  const decir = (texto, ok) => { msgCompra.textContent = texto; msgCompra.className = "gs-detalle__msg gs-detalle__msg--" + (ok ? "ok" : "error"); };
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (agotado) return;
    const talla = tallaElegida();
    if (lleva && !talla) {
      decir("Elige una talla antes de agregar.", false);
      const primera = form.querySelector('input[name="talla"]:not(:disabled)');
      if (primera) primera.focus();
      return;
    }
    ajustarCantidad();
    const r = Carrito.agregar(p.id, talla || "unica", parseInt(cantidad.value, 10));
    decir(r.mensaje, r.ok);
    Ui.aviso(r.mensaje, r.ok ? "ok" : "error");
  });

  /* ---------- Productos relacionados ---------- */
  const rel = Datos.productos()
    .filter(x => x.id !== p.id)
    .sort((a, b) => {
      const punt = x => (x.categoria === p.categoria ? 2 : 0) + (Datos.CATEGORIAS[x.categoria].deporte === Datos.CATEGORIAS[p.categoria].deporte ? 1 : 0);
      return punt(b) - punt(a) || (b.destacado - a.destacado) || (a.id - b.id);
    })
    .slice(0, 4);
  const cajaRel = document.getElementById("relacionados");
  cajaRel.innerHTML = rel.map(x => `<div class="col">${Ui.tarjeta(x)}</div>`).join("");
  Ui.activarAgregar(cajaRel);
  document.getElementById("seccion-relacionados").hidden = rel.length === 0;
})();
