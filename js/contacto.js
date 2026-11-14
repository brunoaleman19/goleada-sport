/*
 * Goleada Sport - Contacto
 * Formulario con validación. El envío es SIMULADO: el mensaje se guarda en el navegador
 * (localStorage) porque el sitio es estático y no tiene servidor que envíe correos.
 */
(async () => {
  await Ui.iniciar();

  const { esc } = Datos;
  const $ = id => document.getElementById(id);
  const form = $("form-contacto");
  const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const SOLO_TEXTO = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]*$/;

  const REGLAS = {
    nombre: v => {
      v = v.trim();
      if (!v) return "Escribe tu nombre.";
      if (v.length < 2) return "El nombre es muy corto.";
      if (!SOLO_TEXTO.test(v)) return "El nombre solo puede tener letras.";
    },
    correo: v => {
      v = v.trim();
      if (!v) return "Escribe tu correo electrónico.";
      if (!CORREO.test(v)) return "Revisa el correo: debe verse como nombre@dominio.com.";
    },
    mensaje: v => {
      v = v.trim();
      if (!v) return "Escribe tu mensaje.";
      if (v.length < 10) return "Cuéntanos un poco más: el mensaje debe tener al menos 10 caracteres.";
    }
  };

  function validar(id) {
    const campo = $(id);
    const error = REGLAS[id](campo.value) || "";
    $("err-" + id).textContent = error;
    if (error) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
    return !error;
  }
  Object.keys(REGLAS).forEach(id => {
    const c = $(id);
    c.addEventListener("blur", () => { if (c.value !== "" || c.dataset.tocado) validar(id); c.dataset.tocado = "1"; });
    c.addEventListener("input", () => { if (c.getAttribute("aria-invalid") === "true") validar(id); });
  });
  $("mensaje").addEventListener("input", e => { $("contador").textContent = e.target.value.length + " / 500"; });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const malos = Object.keys(REGLAS).filter(id => !validar(id));
    if (malos.length) { $(malos[0]).focus(); return; }

    const mensaje = {
      fecha: new Date().toISOString(),
      nombre: $("nombre").value.trim(),
      correo: $("correo").value.trim().toLowerCase(),
      mensaje: $("mensaje").value.trim()
    };
    const boton = $("boton-enviar");
    boton.disabled = true; boton.textContent = "Enviando…";
    setTimeout(() => {
      try {
        const lista = JSON.parse(localStorage.getItem("goleada_mensajes")) || [];
        lista.push(mensaje);
        localStorage.setItem("goleada_mensajes", JSON.stringify(lista.slice(-20)));
      } catch (x) { /* sin almacenamiento */ }
      form.reset();
      $("contador").textContent = "0 / 500";
      form.querySelectorAll("[data-tocado]").forEach(c => delete c.dataset.tocado);
      boton.disabled = false; boton.textContent = "Enviar mensaje";
      form.hidden = true;
      $("exito-texto").innerHTML = "Gracias, <strong>" + esc(mensaje.nombre.split(" ")[0]) + "</strong>. Recibimos tu mensaje y te responderemos a <strong>" + esc(mensaje.correo) + "</strong> en un día hábil.";
      $("exito").hidden = false;
      $("exito").focus();
    }, 900);
  });

  $("otro-mensaje").addEventListener("click", () => {
    $("exito").hidden = true; form.hidden = false; $("nombre").focus();
  });
})();
