/*
 * Goleada Sport - Componentes compartidos
 * Menú superior, pie de página, avisos (toast), tarjeta de producto, newsletter y botón de copiar código.
 * Cada página solo necesita <header id="app-header"> y <footer id="app-footer">.
 */
const Ui = (() => {
  const { esc, formatoPrecio } = Datos;

  /* Íconos en línea (sin librerías externas) */
  const I = (d, extra = "") =>
    `<svg class="gs-ico" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${d}</svg>`;
  const ICONOS = {
    bolsa:     I('<path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    camion:    I('<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>'),
    escudo:    I('<path d="M12 3l7 2.5v5.7c0 4.2-2.7 7.4-7 9.3-4.3-1.9-7-5.1-7-9.3V5.5L12 3z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
    cambio:    I('<path d="M4 9a8 8 0 0 1 14-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M4 20v-4h4"/>'),
    chat:      I('<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>'),
    instagram: I('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/>'),
    tiktok:    I('<path d="M14.5 3v11.2a3.7 3.7 0 1 1-3.7-3.7"/><path d="M14.5 3c.3 2.5 2 4.2 4.5 4.4"/>'),
    copiar:    I('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>')
  };

  /* ---------- Menú superior ---------- */
  function htmlHeader() {
    return `
    <a class="gs-saltar" href="#contenido">Saltar al contenido</a>
    <div class="gs-aviso" role="note">
      <div class="container">Envío gratis desde L 2,000. Tu primera compra tiene 10% de descuento con el código <strong>GOLEADA10</strong>.</div>
    </div>
    <nav class="navbar navbar-expand-lg gs-nav" aria-label="Menú principal">
      <div class="container">
        <a class="navbar-brand" href="index.html"><img src="img/logo.svg" alt="Goleada Sport, inicio" width="167" height="44"></a>
        <div class="d-flex align-items-center gap-1 order-lg-3">
          <a class="gs-carrito" href="carrito.html" id="enlace-carrito" aria-label="Carrito, 0 productos">
            ${ICONOS.bolsa}<span class="gs-badge" data-contador hidden>0</span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menú">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
        <div class="collapse navbar-collapse" id="menuPrincipal">
          <ul class="navbar-nav me-auto ms-lg-4">
            <li class="nav-item"><a class="nav-link" data-nav="inicio" href="index.html">Inicio</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-nav="catalogo" href="catalogo.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">Catálogo</a>
              <ul class="dropdown-menu gs-menu">
                <li><a class="dropdown-item" href="catalogo.html">Todos los productos</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><h6 class="dropdown-header">Fútbol</h6></li>
                <li><a class="dropdown-item" href="catalogo.html?categoria=calzado-futbol">Calzado de fútbol</a></li>
                <li><a class="dropdown-item" href="catalogo.html?categoria=equipamiento-futbol">Equipamiento de fútbol</a></li>
                <li><h6 class="dropdown-header">Running</h6></li>
                <li><a class="dropdown-item" href="catalogo.html?categoria=calzado-running">Calzado de running</a></li>
                <li><a class="dropdown-item" href="catalogo.html?categoria=ropa-accesorios-running">Ropa y accesorios</a></li>
              </ul>
            </li>
            <li class="nav-item"><a class="nav-link" data-nav="promociones" href="index.html#promociones">Promociones</a></li>
            <li class="nav-item"><a class="nav-link" data-nav="contacto" href="contacto.html">Contacto</a></li>
          </ul>
        </div>
      </div>
    </nav>`;
  }

  /* ---------- Pie de página ---------- */
  function htmlFooter() {
    return `
    <div class="container">
      <div class="row gy-5">
        <div class="col-lg-4">
          <img src="img/logo-blanco.svg" alt="Goleada Sport" width="188" height="50" loading="lazy">
          <p class="gs-footer__texto mt-3">Fútbol y running para quienes juegan y corren en Honduras. Equípate para ganar.</p>
        </div>
        <div class="col-6 col-lg-2">
          <h2 class="gs-footer__titulo">Tienda</h2>
          <ul class="gs-footer__lista">
            <li><a href="catalogo.html">Catálogo</a></li>
            <li><a href="catalogo.html?deporte=futbol">Fútbol</a></li>
            <li><a href="catalogo.html?deporte=running">Running</a></li>
            <li><a href="carrito.html">Carrito</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h2 class="gs-footer__titulo">Ayuda</h2>
          <ul class="gs-footer__lista">
            <li><a href="contacto.html">Contacto</a></li>
            <li><a href="index.html#beneficios">Envíos y cambios</a></li>
            <li><a href="index.html#promociones">Promociones</a></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h2 class="gs-footer__titulo">Síguenos</h2>
          <ul class="gs-footer__lista gs-footer__redes">
            <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">${ICONOS.instagram}<span>@goleadasport.hn en Instagram</span></a></li>
            <li><a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">${ICONOS.tiktok}<span>@goleadasport.hn en TikTok</span></a></li>
          </ul>
          <address class="gs-footer__texto mt-3 mb-0">
            San Pedro Sula, Honduras<br>
            <a href="mailto:contacto@goleadasport.hn">contacto@goleadasport.hn</a><br>
            <a href="tel:+50425550000">+504 2555-0000</a>
          </address>
        </div>
      </div>
      <div class="gs-footer__pie">
        <span>© ${new Date().getFullYear()} Goleada Sport. Proyecto académico de Comercio Electrónico, USAP.</span>
        <span>Pagos simulados. Los datos de contacto son ficticios.</span>
      </div>
    </div>`;
  }

  /* ---------- Avisos (toast) ---------- */
  let zonaAvisos;
  function aviso(texto, tipo = "ok") {
    if (!zonaAvisos) {
      zonaAvisos = document.createElement("div");
      zonaAvisos.className = "gs-avisos";
      zonaAvisos.setAttribute("role", "status");
      zonaAvisos.setAttribute("aria-live", "polite");
      document.body.appendChild(zonaAvisos);
    }
    const a = document.createElement("div");
    a.className = "gs-aviso-flotante gs-aviso-flotante--" + tipo;
    a.textContent = texto;
    zonaAvisos.appendChild(a);
    setTimeout(() => { a.classList.add("gs-aviso-flotante--sale"); setTimeout(() => a.remove(), 300); }, 3200);
  }

  /* ---------- Tarjeta de producto ---------- */
  function tarjeta(p, completa = false) {
    const est = Datos.estado(p);
    const agotado = est.clave === "agotado";
    const sinTalla = !Datos.llevaTalla(p);
    const detalle = "producto.html?p=" + encodeURIComponent(p.slug);
    const insignia = est.clave === "disponible" ? "" :
      `<span class="gs-insignia gs-insignia--${est.clave}">${esc(est.texto)}</span>`;
    let accion;
    if (agotado) accion = `<span class="gs-btn gs-btn--fantasma disabled" aria-disabled="true">Agotado</span>`;
    else if (sinTalla) accion = `<button type="button" class="gs-btn gs-btn--oscuro" data-agregar="${p.id}">Agregar al carrito</button>`;
    else accion = `<a class="gs-btn gs-btn--oscuro" href="${detalle}">Elegir talla</a>`;
    // Versión completa (catálogo): descripción, tallas con stock y disponibilidad
    let extra = "";
    if (completa) {
      const tallas = Datos.tallasDe(p).filter(t => Datos.stockTalla(p, t) > 0);
      extra = `
        <p class="gs-producto__desc">${esc(p.descripcion)}</p>
        ${tallas.length ? `<p class="gs-producto__tallas">Tallas: ${tallas.map(esc).join(", ")}</p>` : ""}
        <p class="gs-disp gs-disp--${est.clave}"><span class="gs-disp__punto" aria-hidden="true"></span>${esc(est.texto)}</p>`;
    }
    return `
    <article class="gs-producto${agotado ? " gs-producto--agotado" : ""}">
      <a class="gs-producto__foto" href="${detalle}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.imagen)}" alt="" loading="lazy" width="400" height="500">
        ${insignia}
      </a>
      <div class="gs-producto__cuerpo">
        <p class="gs-producto__cat">${esc(Datos.nombreCategoria(p.categoria))}</p>
        <h3 class="gs-producto__nombre"><a href="${detalle}">${esc(p.nombre)}</a></h3>${extra}
        <p class="gs-producto__precio">${formatoPrecio(p.precio)}</p>
        ${accion}
      </div>
    </article>`;
  }

  /** Botones "Agregar al carrito" de las tarjetas (productos sin talla). */
  function activarAgregar(contenedor) {
    contenedor.addEventListener("click", e => {
      const b = e.target.closest("[data-agregar]");
      if (!b) return;
      const r = Carrito.agregar(b.dataset.agregar, "unica", 1);
      aviso(r.mensaje, r.ok ? "ok" : "error");
    });
  }

  /* ---------- Contador del carrito ---------- */
  function actualizarContador() {
    const n = Carrito.cantidadTotal();
    document.querySelectorAll("[data-contador]").forEach(el => {
      el.textContent = n > 99 ? "99+" : n;
      el.hidden = n === 0;
    });
    const enlace = document.getElementById("enlace-carrito");
    if (enlace) enlace.setAttribute("aria-label", "Carrito, " + n + (n === 1 ? " producto" : " productos"));
  }
  function animarContador() {
    document.querySelectorAll("[data-contador]").forEach(el => {
      el.classList.remove("gs-badge--salta"); void el.offsetWidth; el.classList.add("gs-badge--salta");
    });
  }

  /* ---------- Newsletter (validación en el navegador, sin enviar datos) ---------- */
  const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function activarNewsletter() {
    document.querySelectorAll("form[data-newsletter]").forEach(form => {
      const campo = form.querySelector("input[type=email]");
      const msg = form.querySelector("[data-mensaje]");
      const decir = (texto, error) => {
        msg.textContent = texto;
        msg.className = "gs-form__msg " + (error ? "gs-form__msg--error" : "gs-form__msg--ok");
        campo.setAttribute("aria-invalid", error ? "true" : "false");
      };
      form.addEventListener("submit", e => {
        e.preventDefault();
        const correo = campo.value.trim().toLowerCase();
        if (!correo) return decir("Escribe tu correo para suscribirte.", true);
        if (!CORREO.test(correo) || correo.length > 120) return decir("Revisa el correo: debe verse como nombre@dominio.com.", true);
        let lista = [];
        try { lista = JSON.parse(localStorage.getItem("goleada_newsletter")) || []; } catch (x) { /* vacío */ }
        const yaEstaba = lista.includes(correo);
        if (!yaEstaba) {
          lista.push(correo);
          try { localStorage.setItem("goleada_newsletter", JSON.stringify(lista)); } catch (x) { /* sin almacenamiento */ }
        }
        campo.value = "";
        decir(yaEstaba ? "Ese correo ya estaba suscrito." : "Listo. Te enviaremos las ofertas a tu correo.", false);
      });
      campo.addEventListener("input", () => { msg.textContent = ""; campo.removeAttribute("aria-invalid"); });
    });
  }

  /* ---------- Copiar código de promoción ---------- */
  function activarCopiar() {
    document.addEventListener("click", async e => {
      const b = e.target.closest("[data-copiar]");
      if (!b) return;
      const codigo = b.dataset.copiar;
      try {
        await navigator.clipboard.writeText(codigo);
        aviso("Código " + codigo + " copiado.");
      } catch (x) {
        aviso("Copia el código a mano: " + codigo, "error");
      }
    });
  }

  /* ---------- Arranque común de todas las páginas ---------- */
  async function iniciar() {
    const header = document.getElementById("app-header");
    const footer = document.getElementById("app-footer");
    if (header) header.innerHTML = htmlHeader();
    if (footer) footer.innerHTML = htmlFooter();

    const pagina = document.body.dataset.pagina;
    const activo = document.querySelector(`[data-nav="${pagina}"]`);
    if (activo) { activo.classList.add("active"); activo.setAttribute("aria-current", "page"); }

    await Datos.iniciar();
    actualizarContador();
    window.addEventListener("carrito:cambio", () => { actualizarContador(); animarContador(); });
    window.addEventListener("storage", actualizarContador);
    activarNewsletter();
    activarCopiar();
    if (typeof Golbot !== "undefined") Golbot.iniciar();
  }

  return { ICONOS, tarjeta, activarAgregar, aviso, iniciar };
})();
