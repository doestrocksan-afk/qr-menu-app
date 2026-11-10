# EasyDishMenu — aplicación de cartas para Hostinger

Versión de entrega: Hostinger RC2 · 10/11/2026.

Este repositorio sirve las cartas en `https://menu.easydishmenu.com/r/SLUG`.
La landing de venta, los usuarios, los pagos y la edición siguen en WordPress:
`https://easydishmenu.com`. Publicar esta aplicación NO instala los plugins de
WordPress, ni activa los productos de pago único, ni publica la landing.

## 1. Actualizar tu GitHub sin editar código

1. Descarga el ZIP de esta entrega y extráelo en una carpeta nueva.
2. Abre https://github.com/doestrocksan-afk/qr-menu-app y selecciona `main`.
3. Pulsa `Add file` → `Upload files`.
4. Arrastra el CONTENIDO de la carpeta extraída: `app`, `components`, `lib`,
   `public`, `tests`, los `package*.json` y demás archivos. No arrastres la
   carpeta contenedora ni subas el ZIP como archivo del repositorio.
5. Comprueba que se actualizarán `app/r/[slug]/MenuClient.js` y `package.json`,
   y que no se crea una carpeta adicional por encima de `app`.
6. Escribe como mensaje `Preparar cartas para Hostinger` y pulsa `Commit changes`.
   Conserva el commit anterior si necesitas revertir. Si ya tienes despliegue
   automático, este commit puede iniciarlo.
7. Abre `package.json` en GitHub y comprueba que `build` dice
   `next build --webpack` y Next es `16.4.6`.

La entrega conserva los nombres antiguos de configuración y librerías con
archivos de compatibilidad. No hace falta borrar archivos del repositorio.
El ZIP no contiene secretos, node_modules, .next ni el historial Git.

## 2. Hostinger: tu pantalla de implementación

Después de actualizar GitHub, vuelve a seleccionar el repositorio para que
Hostinger tome el último commit de `main`, y confirma:

| Campo | Valor |
| --- | --- |
| Dominio de la aplicación | menu.easydishmenu.com |
| Framework | Next.js |
| Rama | main |
| Node | 22.x |
| Directorio raíz | ./ |
| Compilación | npm run build |
| Salida, si se solicita | .next |
| Inicio, si se solicita | npm run start |

Mantén el preajuste de Next.js. No selecciones exportación estática ni `out`:
las cartas necesitan consultar WordPress en el servidor.

En **Variables de entorno**, para ESTA versión:

| Clave | Valor |
| --- | --- |
| WORDPRESS_URL | https://easydishmenu.com |

Elimina de esta aplicación las tres filas antiguas:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `REVALIDATE_SECRET`.
Ya no son necesarias para mostrar cartas. No borres el proyecto Supabase ni sus
tablas. No pegues ninguna `sb_secret` o `service_role` en una variable pública.

El endpoint opcional de revalidación queda desactivado sin secreto (503);
esto es intencional y no impide publicar ni editar cartas, que se leen sin
caché de Next.js. Si se habilita en el futuro, necesita un secreto aleatorio de
32 a 256 caracteres y `POST` con `Authorization: Bearer ...`; no acepta la
cadena de unos ni secretos por URL. No lo publiques en GitHub.

Ahora sí: pulsa **Implementar**. Espera a que termine la compilación.
Si ya existe la app, actualiza la configuración y usa la opción de volver a
implementar el último commit.

## 3. Dominio final y DNS

No cambies el dominio de WordPress ni sus nameservers: `easydishmenu.com` sigue
sirviendo el panel y la venta. Solo la aplicación utiliza `menu.easydishmenu.com`.

Si Hostinger indica que `menu` no está conectado, sigue los valores DNS que
muestre para ESTA aplicación. En la zona DNS, sustituye el registro de `menu`
que apuntaba a Vercel por el que pide Hostinger; no mantengas registros A/CNAME
contradictorios para el mismo nombre. No inventes una IP ni reutilices la IP de
WordPress sin que el panel lo indique. Conserva los registros MX y de correo.
Espera a que el certificado HTTPS esté activo.

## 4. Comprobar antes de vender

1. Abre https://menu.easydishmenu.com: debe verse la portada QR Menu.
2. En WordPress, copia la URL de un restaurante real: termina en `/r/su-slug`.
   Si no hay restaurantes, la portada no crea uno automáticamente.
3. Abre esa URL en una ventana privada y en el móvil. Comprueba fotos, precios,
   categorías, búsqueda y diálogo de detalles.
4. Cambia un precio en WordPress, guarda y recarga la carta. Debe reflejarse.
5. Activa otro idioma en el gestor. Añade la traducción de un alérgeno,
   guarda y comprueba su etiqueta en la carta. Las traducciones personalizadas
   requieren la versión corregida RC1 del gestor WordPress.
6. Comprueba que dos restaurantes no comparten la preferencia de idioma.
7. Con el gestor RC1, comprueba con una cuenta de prueba controlada que una
   compra completada habilita el menú y una cuenta sin derecho no lo habilita.
   Un slug inexistente debe mostrar "Carta no disponible".
8. La configuración de MemberPress, el cobro real, los correos y la landing
   deben probarse por separado antes de aceptar clientes. Esta entrega no
   permite certificar esos pasos en tu instalación.

## Cambios y límites

- Etiquetas de los 14 alérgenos: traducciones del restaurante y valores por
  defecto ES, EN, FR, DE, IT, PT. Otros idiomas aceptan traducción manual.
  No se ocultan códigos de alérgenos desconocidos.
- Idioma predeterminado del campo correcto de la API y preferencias aisladas
  por restaurante; almacenamiento bloqueado no rompe la carta.
- Consulta a WordPress con timeout de 10 segundos, sin caché entre peticiones,
  y mensajes separados para ausencia de menú y fallo temporal.
- Validación de colores, enlaces externos y slugs; autenticación de revalidación.
- Portada con hoja de estilos cargada, limpieza de fuentes duplicadas y versiones
  actualizadas de Next/React y dependencias del lockfile.
- Analítica y sincronización anónima con Supabase desactivadas: las rutas antiguas
  devuelven 410 y el tracker no registra visitas. Las estadísticas del panel
  WordPress no tendrán datos nuevos. No vender analítica como función disponible.
- Antes de reactivar estadísticas hay que revisar RLS/permisos, autenticar la
  lectura por propietario, limitar escrituras y resolver el vínculo entre ID de
  WordPress e ID de Supabase. Las políticas reales no se han inspeccionado.
- No se ha migrado ni eliminado ningún dato, modificado DNS ni publicado en
  Hostinger. Tampoco se ha enviado este código a GitHub desde aquí.
- Los cambios del plugin WordPress están en el paquete RC1 separado. Instalar
  esta app sola no arregla la autorización ni la venta del WordPress antiguo.

## Desarrollo y comprobaciones

```sh
npm ci
npm test
npm run lint
npm run build
npm run start
```

Ver `VALIDACION.md` para los resultados y los límites de las comprobaciones.

Documentación del proveedor:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/
