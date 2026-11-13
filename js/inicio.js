/* Goleada Sport - Página principal: pinta los productos destacados */
(async () => {
  await Ui.iniciar();
  const contenedor = document.getElementById("destacados");
  const destacados = Datos.destacados();
  contenedor.innerHTML = destacados.length
    ? destacados.map(p => `<div class="col">${Ui.tarjeta(p)}</div>`).join("")
    : `<p class="col-12">Pronto tendremos productos destacados.</p>`;
  Ui.activarAgregar(contenedor);
})();
