# Contenido de Donna para el video

## Datos disponibles

- Marca: Donna. El repositorio ya incluye `public/logo.jpg` con esa marca.
- Instagram indicado por el usuario: https://www.instagram.com/donna_rio/
- Dominio de producción mostrado en los logs: https://donna-ecommerce.vercel.app

La bio se verificó en la captura del perfil enviada por el usuario:

- Rubro: calzado y ropa.
- Dirección: Leandro N. Alem esq. Córdoba, Río Segundo, Córdoba, Argentina, 5960.
- Horarios: lunes a sábados, 9:00 a 13:00 y 17:00 a 21:00 hs.
- Envíos a todo el país.
- 3 y 6 cuotas sin interés (sin detalle de tarjetas ni condiciones).

Los textos de presentación son redacción para la web, no transcripciones de Instagram.

## Contenido actualizado

Nombre de marca en la tienda, administración, metadatos y mensaje de WhatsApp.
Instagram, dirección y horarios en el pie y la sección de presentación.
Envíos nacionales y cuotas según la bio. Se eliminaron los medios de pago y
plazos de cambios que no estaban confirmados.
La selección de productos destacados ya no se presenta como un ranking de ventas.

## Pendiente de confirmar con el negocio

- WhatsApp: se conserva el valor preexistente; no se verificó que sea del negocio.
  Confirmar el número completo con código de país antes de enviar pedidos reales.
- Tarjetas y condiciones de las cuotas; costos y plazos de entrega; condiciones de cambio.
- Productos, precios, stock y banners: provienen de la base existente. No se
  modificaron ni se contrastaron con Instagram.

## Al desplegar

Configurar `NEXT_PUBLIC_SITE_URL=https://donna-ecommerce.vercel.app` (o el dominio
definitivo) en Vercel y confirmar `NEXT_PUBLIC_WHATSAPP_NUMBER`. Los ajustes locales
de `.env` no actualizan las variables de Vercel. Los enlaces de Instagram usan
`src/lib/storefront.ts` para no depender de un usuario anterior en las variables.
