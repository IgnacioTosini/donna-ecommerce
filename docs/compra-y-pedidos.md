# Compra y gestión de pedidos

## Guía de talles

En Productos, el formulario incluye «Guía de talles y medidas». Cargar medidas
reales por talle, unidades y cómo medir. Admite texto con saltos de línea hasta
5000 caracteres. Si está vacía, la ficha pública no muestra el botón. No se
inventaron medidas ni se modificaron productos existentes para rellenarlas.

## Pedidos

El buscador existente se combina con filtros de estado y fechas inclusivas, usando
el día de Argentina. «Limpiar filtros» restablece la lista. Se muestra el número
de resultados. El enlace de WhatsApp aparece si hay un número internacional
identificable; para otros teléfonos, editarlo con + y código de país desde el
detalle. No se envían mensajes automáticamente.

## Stock

- Nuevos pedidos: nacen pendientes, sin reservar ni descontar stock.
- Confirmar: verifica y descuenta stock dentro de una transacción. Si no alcanza,
  devuelve error y no confirma el pedido ni aplica descuentos parciales.
- El pedido se bloquea durante la transición para impedir descuentos o
  reposiciones duplicadas ante dos cambios simultáneos.
- Cancelar un confirmado repone exactamente lo que se descontó.
- Enviar y entregar conservan el descuento. No se permite cancelar ni eliminar
  pedidos enviados/entregados: una devolución física necesita revisión separada.
- Solo se pueden eliminar pendientes y cancelados. Un confirmado debe cancelarse
  primero; eliminarlo directamente podría ocultar una venta.
- Los pendientes antiguos ya tenían stock descontado. La migración preserva ese
  dato: confirmarlos no vuelve a descontar y cancelarlos/eliminarlos lo repone.
  Para liberar reservas abandonadas antiguas, filtrar pendientes y cancelarlos.
- No hay tareas periódicas ni cron. Los pendientes nuevos abandonados no bloquean
  unidades. La tienda explica que la solicitud queda sujeta a confirmación.

El dashboard lista hasta 50 variantes por talle con stock <= 3, ordenadas por
menor stock, y muestra el total de alertas. El importe y ticket medio excluyen
pendientes y cancelados; representan pedidos confirmados/enviados/entregados,
no una verificación de cobros.

## Cambios y entregas

En Datos del negocio se editan «Condiciones de entrega» y «Condiciones de cambio».
Usan el mismo circuito de borrador y publicación. La página `/ayuda` es accesible
desde el pie, las fichas y el checkout. Los textos iniciales remiten a consultar
al negocio: todavía deben completar plazos y condiciones reales de Donna.

## Migración y pruebas

La migración `20260908010000_shopping_improvements` agrega `Product.sizeGuide` y
`Order.stockDeducted`; identifica pedidos anteriores cuyo stock ya fue descontado.
Fue aplicada únicamente a PostgreSQL local. El build existente aplica migraciones
al desplegar. No publicar el nuevo código contra una base sin esta migración.

`node --test tests/shopping.integration.test.mjs tests/site-content.test.mjs`
ejecuta pruebas con registros temporales en PostgreSQL local y los elimina al
terminar. El test integrado rechaza destinos no locales. Cubre concurrencia,
stock, compatibilidad de pedidos antiguos, filtros de fecha y enlaces de contacto.
