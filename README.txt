PROYECTO PROFESIONAL - CATÁLOGO + CARRITO + WHATSAPP

ARCHIVOS PRINCIPALES:
- index.html: página principal con catálogo, categorías, filtros y carrito.
- producto.html: página individual con variantes, tallas, colores, varias imágenes y carrito.
- productos.js: aquí editas productos, precios, categorías, variantes e imágenes.
- app.js: lógica general del catálogo y carrito.
- producto.js: lógica de página individual.
- styles.css: diseño completo.
- img/: imágenes del proyecto.

CÓMO CAMBIAR WHATSAPP:
En productos.js cambia:
const WHATSAPP_NUMBER = "573001234567";

CÓMO AGREGAR UN PRODUCTO:
Copia un objeto dentro del arreglo products en productos.js.

CÓMO AGREGAR VARIANTES CON VARIAS IMÁGENES:
variants: [
  {
    name: "Azul Claro / Talla M",
    color: "Azul Claro",
    size: "M",
    price: 135000,
    images: [
      "img/foto-1.jpg",
      "img/foto-2.jpg",
      "img/foto-3.jpg"
    ]
  }
]

IMPORTANTE:
El precio va como número, sin puntos ni signo:
price: 135000

El sistema lo muestra automáticamente como moneda colombiana.

PARA USAR FOTOS REALES:
Guarda tus fotos en /img y actualiza las rutas en products.js.
