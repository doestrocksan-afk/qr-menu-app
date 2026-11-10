# Validación de la entrega Hostinger RC2

Fecha: 10/11/2026. Base: commit a8db44f de qr-menu-app.

- `npm test`: 16 pruebas, 16 correctas. Incluyen traducciones de alérgenos,
  idioma por defecto, entradas inseguras, autenticación de revalidación,
  cierre de APIs antiguas y respuesta ante suspensión/fallo de WordPress.
- `npm run lint`: 0 errores y 6 avisos por imágenes HTML (`img`). Se conserva
  este comportamiento para no activar un servicio adicional de optimización
  de imágenes en esta migración.
- `npm run build`: compilación de producción correcta con Next 16.4.6 y webpack.
  Genera portada y rutas dinámicas de cartas/API; no requiere claves Supabase.
- `npm audit --omit=dev`: 0 vulnerabilidades informadas en dependencias de
  producción al realizar la comprobación. Se actualizó source-map-js a 1.2.2.
- La auditoría completa conserva 7 avisos moderados de desarrollo, derivados
  de minimatch en la cadena de typescript-eslint. No se forzó un cambio mayor
  de sus dependencias. Este resultado no equivale a una auditoría de seguridad
  completa del producto ni de WordPress/Supabase.
- `git diff --check`: correcto.

La validación local se realizó con Node 24.22.1. El proyecto admite Node 22 y 24;
la compilación en Node 22 de Hostinger sigue pendiente de ejecutar allí.
No se ha realizado una validación visual en navegador, un test de carga, una
compra real ni una prueba de extremo a extremo contra tu WordPress y sus
cuentas. Tampoco se ha verificado el DNS final ni el SSL de Hostinger.

La publicación y la validación del flujo de venta siguen pendientes: consulta
README.md. Los tests de WordPress usan respuestas controladas, no datos reales.
