# Goleada Sport

Tienda deportiva en línea de **fútbol y running** con un chatbot de atención al cliente (**Golbot**), hecha para Honduras: sitio en español y precios en lempiras (L).

Proyecto final de la clase **Comercio Electrónico** (USAP), docente Ing. Marlon Noriega. Proyecto individual, Grupo #3.

**Sitio en línea:** https://brunoaleman19.github.io/goleada-sport/

## Qué incluye

| Requisito del proyecto | Dónde está |
| --- | --- |
| Página de inicio con marca, logo, banner, menú y productos destacados | `index.html` |
| Catálogo con imagen, nombre, precio, descripción, categoría y disponibilidad | `catalogo.html`, `producto.html` |
| Carrito: agregar, quitar, cambiar cantidades, subtotal y total | `carrito.html` |
| Compra con formulario validado y pago simulado | `checkout.html` |
| Formulario de contacto (nombre, correo y mensaje) con validación | `contacto.html` |
| Chatbot de atención al cliente | `js/golbot.js` (en todas las páginas) |
| Marketing digital: promociones, banners, cupón, boletín y redes sociales | `index.html`, `js/componentes.js` |
| SEO básico: títulos, descripciones, URLs amigables, etiquetas, `sitemap.xml` | todas las páginas |
| Seguridad básica: HTTPS, validación de formularios, política de contenido (CSP) | todas las páginas |
| Diseño adaptable a celular, tableta y computadora | `css/estilos.css` |

### Detalles de la tienda
- **12 productos** en 4 categorías: calzado de fútbol, equipamiento de fútbol, calzado de running y ropa y accesorios de running.
- **Tallas con stock por talla.** Calzado y guantes: 7, 8, 9 y 10. Camiseta y short: S, M, G y XG. Balón, espinilleras y botella no llevan talla.
- **Filtros** por deporte, categoría, precio y disponibilidad, más búsqueda y orden. Los filtros viven en la URL, por ejemplo `catalogo.html?deporte=futbol&orden=precio-asc`.
- **Precios con ISV (15%) incluido.** El carrito muestra cuánto del total es impuesto.
- **Envío:** L 150, gratis desde L 2,000.
- **Cupón:** `GOLEADA10` da 10% de descuento en la primera compra.
- **Golbot** es un chatbot basado en reglas (sin inteligencia artificial ni servicios externos): responde preguntas frecuentes, consulta precio y stock reales del catálogo y recomienda productos por deporte, categoría y presupuesto.

## Tecnologías
- HTML5, CSS3 y JavaScript sin frameworks.
- Bootstrap 5.3 (copia local, sin CDN).
- Fuentes Barlow Condensed e Inter, en archivos locales.
- Sin dependencias externas: el sitio funciona sin conexión a otros servidores.
- Publicado con GitHub Pages (HTTPS).

## Cómo probarlo
- **En línea:** abre el enlace de arriba.
- **En tu computadora:** descarga el repositorio y abre `index.html` con doble clic. No necesita servidor.

### Para la demostración
- Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVV. El pago es simulado: no se cobra nada y la tarjeta no se guarda.
- Cada compra descuenta el stock y se muestra cuántas unidades quedan.
- El carrito, el stock vendido, los pedidos y los mensajes se guardan en el navegador (`localStorage`). Cada dirección (el archivo local y `github.io`) guarda sus propios datos, y cada visitante ve su propio stock.

## Estructura del proyecto
```
goleada-sport/
├── index.html, catalogo.html, producto.html,
│   carrito.html, checkout.html, contacto.html
├── sitemap.xml, robots.txt
├── css/
│   ├── estilos.css          estilos propios (prefijo gs-)
│   ├── bootstrap.min.css
│   └── fonts/               fuentes locales
├── js/
│   ├── datos.js             única capa que lee productos y stock
│   ├── carrito.js           carrito, cupón, envío e ISV
│   ├── componentes.js       encabezado, pie, tarjetas, avisos, boletín
│   ├── golbot.js            chatbot
│   ├── inicio.js, catalogo.js, producto.js,
│   │   carrito-pagina.js, checkout.js, contacto.js   lógica de cada página
│   └── vendor/              Bootstrap JS
├── data/
│   └── productos.js         catálogo de productos y stock inicial
└── img/                     logo, banner y fotos de productos
```

## Por qué es un sitio estático y cómo crecería
El sitio no tiene servidor ni base de datos, por eso el inventario vive en el navegador y no se comparte entre visitantes. Todo el acceso a productos y stock pasa por `js/datos.js`. Para conectar una base de datos real basta con cambiar esa capa para que lea de una API, sin tocar las páginas. En una tienda real, el servidor también repetiría las validaciones de los formularios, cobraría con una pasarela de pagos y enviaría los correos.

## Limitaciones conocidas
- El pago, el envío de correos del formulario de contacto y del boletín son simulados.
- El stock no se comparte entre visitantes ni dispositivos.
- Los datos de contacto de la tienda (correo, teléfono, redes) son ficticios.
- La validación de formularios ocurre en el navegador y mejora la experiencia, pero no sustituye la validación de un servidor.
- Las páginas de producto comparten un solo archivo y el título y la descripción los cambia JavaScript, así que las vistas previas al compartir muestran el texto general.

## Créditos
- Fotografías de bancos de imágenes de licencia libre.
- Logo y diseño de marca creados para este proyecto.
- Autor: Bruno Aleman.
