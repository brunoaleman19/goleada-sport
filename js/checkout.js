/*
 * Goleada Sport - Finalizar compra
 * Formulario con validación, pago con tarjeta SIMULADO (no se envía ni se guarda ningún dato de la tarjeta),
 * descuento de stock y pantalla de confirmación.
 */
(async () => {
  await Ui.iniciar();

  const { esc, formatoPrecio } = Datos;
  const $ = id => document.getElementById(id);
  const form = $("form-checkout");
  const DEPARTAMENTOS = ["Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso", "Francisco Morazán",
    "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz", "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro"];
  let finalizado = false;

  $("departamento").innerHTML = '<option value="">Elige un departamento</option>' +
    DEPARTAMENTOS.map(d => `<option>${esc(d)}</option>`).join("");

  /* ---------- Resumen del pedido ---------- */
  function pintarResumen() {
    if (finalizado) return;
    const lineas = Carrito.lineas();
    $("checkout-vacio").hidden = lineas.length > 0;
    $("checkout-contenido").hidden = lineas.length === 0;
    if (!lineas.length) return;
    $("mini-lineas").innerHTML = lineas.map(l => `
      <li class="gs-mini__item">
        <img src="${esc(l.producto.imagen)}" alt="" width="56" height="56" loading="lazy">
        <div><p class="gs-mini__nombre">${esc(l.producto.nombre)}</p>
          <p class="gs-mini__meta">${Datos.llevaTalla(l.producto) ? "Talla " + esc(l.talla) + " · " : ""}Cantidad ${l.cantidad}</p></div>
        <p class="gs-mini__precio">${formatoPrecio(l.subtotal)}</p>
      </li>`).join("");
    $("totales").innerHTML = htmlTotales(Carrito.resumen());
  }
  function htmlTotales(r) {
    const fila = (t, v, c = "") => `<div class="gs-totales__fila ${c}"><dt>${t}</dt><dd>${v}</dd></div>`;
    return fila("Subtotal", formatoPrecio(r.subtotal)) +
      (r.cupon ? fila("Descuento " + esc(r.cupon), "− " + formatoPrecio(r.descuento), "gs-totales__fila--desc") : "") +
      fila("Envío", r.envio ? formatoPrecio(r.envio) : "Gratis") +
      fila("Total", formatoPrecio(r.total), "gs-totales__fila--total") +
      fila("Incluye ISV (15%)", formatoPrecio(r.isv), "gs-totales__fila--isv");
  }

  /* ---------- Validaciones ---------- */
  const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const SOLO_TEXTO = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]*$/;
  const digitos = s => s.replace(/\D/g, "");

  function luhn(num) {
    let suma = 0, doble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = Number(num[i]);
      if (doble) { d *= 2; if (d > 9) d -= 9; }
      suma += d; doble = !doble;
    }
    return suma % 10 === 0;
  }
  const REGLAS = {
    nombre: v => {
      v = v.trim();
      if (!v) return "Escribe tu nombre completo.";
      if (v.length < 5 || !v.includes(" ")) return "Escribe tu nombre y apellido.";
      if (!SOLO_TEXTO.test(v)) return "El nombre solo puede tener letras.";
    },
    telefono: v => {
      let d = digitos(v);
      if (!d) return "Escribe tu número de teléfono.";
      if (d.length === 11 && d.startsWith("504")) d = d.slice(3);
      if (d.length !== 8 || !/^[2389]/.test(d)) return "Escribe un teléfono de Honduras de 8 dígitos, por ejemplo 9999-9999.";
    },
    correo: v => {
      v = v.trim();
      if (!v) return "Escribe tu correo electrónico.";
      if (!CORREO.test(v)) return "Revisa el correo: debe verse como nombre@dominio.com.";
    },
    departamento: v => { if (!v) return "Elige tu departamento."; },
    ciudad: v => {
      v = v.trim();
      if (!v) return "Escribe tu ciudad.";
      if (v.length < 2 || !SOLO_TEXTO.test(v)) return "La ciudad solo puede tener letras.";
    },
    direccion: v => {
      v = v.trim();
      if (!v) return "Escribe tu dirección de entrega.";
      if (v.length < 10) return "Agrega más detalle: colonia, calle, número de casa y una referencia.";
    },
    "tarjeta-nombre": v => {
      v = v.trim();
      if (!v) return "Escribe el nombre que aparece en la tarjeta.";
      if (v.length < 3 || !SOLO_TEXTO.test(v)) return "El nombre solo puede tener letras.";
    },
    "tarjeta-numero": v => {
      const d = digitos(v);
      if (!d) return "Escribe el número de tu tarjeta.";
      if (d.length < 13 || d.length > 19) return "El número debe tener entre 13 y 19 dígitos.";
      if (!luhn(d)) return "El número de tarjeta no es válido. Revísalo.";
    },
    "tarjeta-vence": v => {
      const m = /^(\d{2})\/(\d{2})$/.exec(v.trim());
      if (!v.trim()) return "Escribe la fecha de vencimiento.";
      if (!m) return "Usa el formato MM/AA, por ejemplo 08/29.";
      const mes = Number(m[1]), anio = 2000 + Number(m[2]), hoy = new Date();
      if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12.";
      if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) return "La tarjeta está vencida.";
      if (anio > hoy.getFullYear() + 15) return "Revisa el año de vencimiento.";
    },
    "tarjeta-cvv": v => {
      if (!v.trim()) return "Escribe el CVV.";
      if (!/^\d{3,4}$/.test(v.trim())) return "El CVV tiene 3 o 4 números.";
    }
  };

  function validarCampo(id) {
    const campo = $(id), msg = $("err-" + id);
    const error = REGLAS[id](campo.value) || "";
    msg.textContent = error;
    if (error) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
    return !error;
  }
  Object.keys(REGLAS).forEach(id => {
    const c = $(id);
    c.addEventListener("blur", () => { if (c.value !== "" || c.dataset.tocado) validarCampo(id); c.dataset.tocado = "1"; });
    c.addEventListener("input", () => { if (c.getAttribute("aria-invalid") === "true") validarCampo(id); });
    c.addEventListener("change", () => { if (c.getAttribute("aria-invalid") === "true") validarCampo(id); });
  });

  form.addEventListener("input", () => { $("err-general").textContent = ""; });

  /* ---------- Formato automático de la tarjeta ---------- */
  $("tarjeta-numero").addEventListener("input", e => {
    e.target.value = digitos(e.target.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  $("tarjeta-vence").addEventListener("input", e => {
    let d = digitos(e.target.value).slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });
  $("tarjeta-cvv").addEventListener("input", e => { e.target.value = digitos(e.target.value).slice(0, 4); });

  /* ---------- Enviar el pedido ---------- */
  function numeroPedido() {
    const f = new Date(), p = n => String(n).padStart(2, "0");
    return "GS-" + String(f.getFullYear()).slice(2) + p(f.getMonth() + 1) + p(f.getDate()) + "-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const general = $("err-general");
    general.textContent = "";
    const ids = Object.keys(REGLAS);
    const malos = ids.filter(id => !validarCampo(id));
    if (malos.length) {
      general.textContent = malos.length === 1 ? "Corrige el campo marcado para continuar." : "Corrige los " + malos.length + " campos marcados para continuar.";
      $(malos[0]).focus();
      return;
    }
    // El stock se revisa otra vez justo antes de pagar
    const guardadas = Carrito.lineas();
    if (!guardadas.length) { pintarResumen(); return; }
    const boton = $("boton-pagar");
    boton.disabled = true; boton.textContent = "Procesando pago…";
    setTimeout(() => confirmar(), 1200);
  });

  function confirmar() {
    const lineas = Carrito.lineas();
    const r = Carrito.resumen();
    if (!lineas.length) { pintarResumen(); return; }
    const pedido = {
      numero: numeroPedido(),
      fecha: new Date().toISOString(),
      cliente: { nombre: $("nombre").value.trim(), telefono: $("telefono").value.trim(), correo: $("correo").value.trim().toLowerCase() },
      envio: { departamento: $("departamento").value, ciudad: $("ciudad").value.trim(), direccion: $("direccion").value.trim(), nota: $("nota").value.trim() },
      pago: "Tarjeta terminada en " + digitos($("tarjeta-numero").value).slice(-4),
      resumen: r,
      items: lineas.map(l => ({ id: l.id, nombre: l.producto.nombre, talla: l.talla, cantidad: l.cantidad, precio: l.producto.precio, imagen: l.producto.imagen }))
    };
    Datos.descontarStock(lineas.map(l => ({ id: l.id, talla: l.talla, cantidad: l.cantidad })));
    try {
      const prev = JSON.parse(localStorage.getItem("goleada_pedidos")) || [];
      prev.push(pedido);
      localStorage.setItem("goleada_pedidos", JSON.stringify(prev.slice(-20)));
    } catch (x) { /* sin almacenamiento */ }
    finalizado = true;
    Carrito.vaciar();
    Carrito.quitarCupon();
    form.reset();   // los datos de la tarjeta no se conservan
    mostrarConfirmacion(pedido);
  }

  function mostrarConfirmacion(p) {
    $("checkout-contenido").hidden = true;
    $("checkout-vacio").hidden = true;
    $("titulo-checkout").textContent = "¡Gracias por tu compra!";
    document.title = "Pedido confirmado | Goleada Sport";
    const filas = p.items.map(i => {
      const prod = Datos.porId(i.id);
      const quedan = prod ? Datos.stockTalla(prod, i.talla) : 0;
      const lleva = prod && Datos.llevaTalla(prod);
      return `<li class="gs-mini__item">
        <img src="${esc(i.imagen)}" alt="" width="56" height="56">
        <div><p class="gs-mini__nombre">${esc(i.nombre)}</p>
          <p class="gs-mini__meta">${lleva ? "Talla " + esc(i.talla) + " · " : ""}Cantidad ${i.cantidad}</p>
          <p class="gs-mini__stock">Quedan ${quedan} ${quedan === 1 ? "unidad" : "unidades"}${lleva ? " en esa talla" : ""} en la tienda.</p></div>
        <p class="gs-mini__precio">${formatoPrecio(i.precio * i.cantidad)}</p>
      </li>`;
    }).join("");
    const c = $("confirmacion");
    c.hidden = false;
    c.innerHTML = `
      <p class="gs-confirmacion__lead">Recibimos tu pedido <strong>${esc(p.numero)}</strong>. Te enviaremos la confirmación a <strong>${esc(p.cliente.correo)}</strong>.</p>
      <div class="row g-4 g-lg-5">
        <div class="col-lg-7"><section class="gs-resumen gs-resumen--plano" aria-labelledby="t-items">
          <h2 id="t-items">Productos</h2><ul class="gs-mini">${filas}</ul></section></div>
        <div class="col-lg-5"><section class="gs-resumen" aria-labelledby="t-datos">
          <h2 id="t-datos">Detalles</h2>
          <dl class="gs-totales">${htmlTotales(p.resumen)}</dl>
          <p class="gs-confirmacion__dato"><strong>Envío a</strong><br>${esc(p.cliente.nombre)}<br>${esc(p.envio.direccion)}, ${esc(p.envio.ciudad)}, ${esc(p.envio.departamento)}<br>Tel. ${esc(p.cliente.telefono)}</p>
          <p class="gs-confirmacion__dato"><strong>Pago</strong><br>${esc(p.pago)} (simulado)</p>
          <p class="gs-confirmacion__dato"><strong>Entrega estimada</strong><br>2 a 5 días hábiles</p>
        </section></div>
      </div>
      <div class="gs-confirmacion__acciones">
        <a class="gs-btn gs-btn--verde gs-btn--grande" href="catalogo.html">Seguir comprando</a>
        <a class="gs-btn gs-btn--borde gs-btn--grande" href="index.html">Ir al inicio</a>
      </div>`;
    c.focus();
    window.scrollTo({ top: 0 });
  }

  window.addEventListener("carrito:cambio", pintarResumen);
  pintarResumen();
})();
