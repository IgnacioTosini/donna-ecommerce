# Edición del Home y datos del negocio

## Uso

- `/admin/inicio`: secciones en el orden del Home, textos, botones, imagen de
  presentación, cantidad de productos (1–12) y visibilidad de cada bloque.
- `/admin/negocio`: contacto, horarios, dirección, Instagram, WhatsApp, envíos,
  cuotas y presentación del negocio.
- Guardar borrador conserva el trabajo sin modificar la tienda pública.
- Vista previa abre `/admin/vista-previa` y reúne los dos borradores guardados.
  Requiere sesión de administrador y no permite enviar pedidos desde el carrito.
  Los enlaces que salen de esta página abren el sitio publicado.
- Publicar cambios aplica únicamente el apartado abierto. Para publicar cambios
  de ambos apartados hay que publicar cada uno.
- Banners conserva su administración existente y publicación inmediata. Los
  controles del nuevo editor solo gestionan la visibilidad de sus tres ubicaciones.
- Los productos destacados se eligen con la marca «destacado» en Productos;
  novedades utiliza los productos activos más recientes.

## Persistencia y despliegue

La migración `20260908000000_site_content` agrega la tabla `SiteContent` sin
modificar catálogo ni pedidos. Ejecutar `npx prisma migrate deploy` antes de
iniciar la nueva versión y `npx prisma generate` para regenerar el cliente.
El script de build existente ya ejecuta ambos pasos antes de `next build`.

La primera visita pública usa los datos actuales de Donna si no hay registros.
Al abrir cada editor se crea su registro con los valores iniciales. WhatsApp se
toma inicialmente de `NEXT_PUBLIC_WHATSAPP_NUMBER`; después de publicar los
datos del negocio se usa el valor guardado en la base. Un valor vacío oculta el
enlace de WhatsApp e impide crear un pedido que no se pueda enviar.

El contenido publicado se guarda en la Data Cache de Next sin vencimiento por
tiempo. Guardar borradores no invalida esa caché; publicar invalida la etiqueta
`site-content` y las páginas que comparten el layout. Los datos del catálogo
conservan su caché existente. Las lecturas públicas nunca devuelven borradores.

Las escrituras y lecturas privadas verifican la sesión en el servidor. La versión
de cada registro permite rechazar guardados/publicaciones de pestañas antiguas.
Los enlaces admiten rutas internas y HTTPS; las imágenes admiten rutas locales y
Cloudinary. Las imágenes reemplazadas no se borran automáticamente de Cloudinary,
porque podrían seguir en uso por una versión publicada u otra sección.

## Verificación

Las nuevas imágenes se organizan bajo `CLOUDINARY_UPLOAD_FOLDER` en las
subcarpetas `home`, `banners`, `productos` y `categorias`. Con la configuración
local actual resultan `donna/home`, `donna/banners`, `donna/productos` y
`donna/categorias`. El servidor solo admite esas cuatro secciones. Los archivos
existentes mantienen sus URLs y su ubicación; no se migran automáticamente.

`node --test tests/site-content.test.mjs` cubre aislamiento de borradores,
publicación por apartado, invalidación de caché, autorización, conflictos entre
pestañas y validación de enlaces/datos. Usa adaptadores en memoria: no reemplaza
una prueba con PostgreSQL y navegador.

Además: `npx tsc --noEmit --incremental false`, `npm run lint`,
`npx prisma validate` y compilación Next con
`npx next build --webpack --experimental-build-mode compile`.

En este entorno no se aplicó la migración: PostgreSQL local y Docker estaban
apagados. El navegador de verificación no pudo conectarse. Queda pendiente la
prueba visual y la prueba integrada de guardar/previsualizar/publicar con la base
activa. No se publicó el proyecto en Vercel.
