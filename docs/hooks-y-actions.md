# Hooks y Actions

Esta guia resume los hooks custom del proyecto, los stores de Zustand que se consumen como hooks y los metodos exportados desde `src/app/actions`.

## Hooks custom

### `useSearch`

Archivo: `src/hooks/useSearch.ts`

Filtra una lista en memoria usando un texto de busqueda.

- Recibe `items` y una funcion `searchFn(item, query)`.
- Mantiene `query` con `useState`.
- Calcula `filteredItems` con `useMemo`.
- Normaliza la busqueda con `trim().toLowerCase()`.
- Si el query esta vacio, devuelve la lista completa.

Devuelve:

- `query`: texto actual.
- `setQuery`: setter del texto.
- `filteredItems`: items filtrados.

Uso tipico: tablas admin o listas locales donde no hace falta pedir datos al servidor.

### `useSortableTable`

Archivo: `src/hooks/useSortableTable.ts`

Ordena una lista en memoria por columnas configurables.

- Recibe `items`, `columns` e `initialSort`.
- Cada columna define `key`, `accessor` y opcionalmente `defaultDirection`.
- Soporta valores `string`, `number`, `boolean`, `Date`, `null` y `undefined`.
- Para strings usa `localeCompare` en locale `es`, con comparacion numerica y sin sensibilidad a mayusculas.
- Mantiene orden estable usando el indice original cuando dos valores empatan.

Devuelve:

- `sortedItems`: lista ordenada.
- `sortState`: columna y direccion actual.
- `sortBy(key)`: alterna ascendente/descendente si se repite columna, o aplica la direccion default.
- `getSortDirection(key)`: devuelve `asc`, `desc` o `null`.

Uso tipico: tablas de productos, categorias, banners y pedidos.

### `useImageUpload`

Archivo: `src/hooks/useImageUpload.ts`

Gestiona seleccion, preview y subida de imagenes.

- Mantiene `files`, `previews` y `loading`.
- `onChange` toma los archivos del input, revoca previews anteriores y genera URLs temporales con `URL.createObjectURL`.
- `uploadMany(options)` sube todos los archivos con `ImageService.uploadImage`.
- Si una subida falla, muestra `toast.error` y relanza el error.
- `reset` limpia archivos/previews y revoca las URLs temporales.
- `remove(index)` quita un archivo puntual y revoca su preview.

Devuelve:

- `files`, `previews`, `loading`.
- `onChange`, `uploadMany`, `reset`, `remove`.

Uso tipico: formularios admin que crean o editan productos, categorias o banners con imagenes.

### `useNavbarSearch`

Archivo: `src/components/layout/Navbar/useNavbarSearch.ts`

Controla la busqueda del navbar.

- Recibe `isSearchOpen`.
- Enfoca el input cuando la busqueda se abre.
- Mantiene `searchQuery`, `searchResults`, `isSearching` y `searchError`.
- Espera 250 ms antes de llamar a `/api/products/search`.
- Usa `AbortController` para cancelar requests anteriores si cambia el texto o se cierra la busqueda.
- Limpia resultados y errores cuando cambia el query.

Devuelve:

- `searchInputRef`.
- `searchQuery` y `trimmedSearchQuery`.
- `searchResults`, `isSearching`, `searchError`.
- `handleSearchQueryChange(value)`.
- `resetSearch()`.

Uso tipico: `NavbarSearch` y acciones de busqueda mobile/desktop del navbar.

### `useCategoryFilterOptions`

Archivo: `src/components/ui/categoryPage/categoryFilterSidebar/useCategoryFilterOptions.ts`

Calcula las opciones disponibles para el filtro de categorias/productos.

- Recibe `products`, `priceProducts` y `filters`.
- Deriva talles disponibles partiendo de `PRODUCT_SIZE_ORDER`.
- Deriva colores disponibles desde variantes con stock.
- Si hay talle activo, solo muestra colores de variantes con stock para ese talle.
- Normaliza colores y talles antes de comparar.
- Calcula `minPrice`, `maxAvailablePrice` y `selectedMaxPrice`.
- Usa `priceProducts` para el rango de precio cuando se pasa; si no, usa `products`.

Devuelve:

- `sortedSizes`.
- `sortedColors`.
- `minPrice`.
- `maxAvailablePrice`.
- `selectedMaxPrice`.

Uso tipico: `CategoryFilterSidebar`, para no mezclar calculos de negocio con render.

### `useMobileFilterSheet`

Archivo: `src/components/ui/categoryPage/categoryFilterSidebar/useMobileFilterSheet.ts`

Controla el bottom sheet mobile de filtros.

- Mantiene `isOpen`.
- Expone `open()` y `close()`.
- Cuando el sheet esta abierto, bloquea el scroll del `body`.
- Cierra con la tecla `Escape`.
- Al desmontar o cerrar, restaura el overflow anterior del body y remueve listeners.

Devuelve:

- `isOpen`.
- `open()`.
- `close()`.

Uso tipico: `CategoryFilterSidebar`.

## Stores Zustand usados como hooks

Estos exports no son hooks React escritos a mano, pero se consumen con la misma convencion `use...`.

### `useCartStore`

Archivo: `src/store/cart.store.ts`

Estado global del carrito, persistido en `localStorage` con la key `donna-cart`.

Estado:

- `items`: productos agregados al carrito.
- `totalItems`: suma de cantidades.
- `subtotal`: suma de `price * quantity`.
- `isOpen`: estado del drawer del carrito.

Metodos:

- `addItem(item)`: agrega un item nuevo o incrementa cantidad si ya existe `itemKey`; abre el carrito.
- `updateItemQuantity(itemKey, quantity)`: actualiza cantidad; si la cantidad queda en `0`, elimina el item.
- `removeItem(itemKey)`: elimina un item.
- `openCart()`, `closeCart()`, `toggleCart()`: controlan el drawer.
- `clearCart()`: vacia items y totales.

Detalles:

- Recalcula totales con `calculateTotals`.
- Valida estado persistido con `isCartItem` durante migracion.
- No persiste `isOpen`, solo items y totales.

### `useProductModalStore`

Archivo: `src/store/product.store.ts`

Estado global del modal de productos en admin.

Estado:

- `isOpen`.
- `editingProductId`.
- `selectedProductId`.
- `editingProduct`.

Metodos:

- `openCreate()`: abre modal para crear producto.
- `openEdit(product)`: abre modal para editar producto existente.
- `close()`: cierra modal y limpia estado de edicion.
- `selectProduct(id)`: guarda producto seleccionado.

### `useCategoryModalStore`

Archivo: `src/store/category.store.ts`

Estado global del modal de categorias en admin.

Metodos:

- `openCreate()`: abre modal para crear categoria.
- `openEdit(category)`: abre modal para editar categoria existente.
- `close()`: cierra modal y limpia estado de edicion.
- `selectCategory(id)`: guarda categoria seleccionada.

### `useBannerModalStore`

Archivo: `src/store/banner.store.ts`

Estado global del modal de banners en admin.

Metodos:

- `openCreate()`: abre modal para crear banner.
- `openEdit(banner)`: abre modal para editar banner existente.
- `close()`: cierra modal y limpia estado de edicion.
- `selectBanner(id)`: guarda banner seleccionado.

## Server actions

### Admin

Archivo: `src/app/actions/admin.actions.ts`

#### `loginAdmin(password)`

Valida la clave admin contra `SECRET_API_KEY` o `NEXT_PUBLIC_SECRET_API_KEY`.

- Si no coincide, devuelve `{ error: 'Clave incorrecta' }`.
- Si coincide, escribe la cookie `admin-session=true`.
- La cookie es `httpOnly`, dura 24 horas y usa `secure` en produccion.
- Devuelve `{ success: true }`.

### Banners

Archivo: `src/app/actions/banner.action.ts`

#### `createBannerWithImage({ data, image })`

Crea un banner con datos del formulario e imagen ya subida.

- Guarda texto, link, orden, estado, placement, `imageUrl` y `publicId`.
- Revalida `/admin/banners` y `/`.
- Devuelve `{ ok: true, banner }` o `{ ok: false, message }`.

#### `updateBannerWithImage(bannerId, data, image?)`

Actualiza un banner existente.

- Busca el banner dentro de una transaccion.
- Si no existe, devuelve error.
- Si llega una nueva imagen, elimina la anterior en Cloudinary y reemplaza `imageUrl/publicId`.
- Actualiza campos editables.
- Revalida `/admin/banners` y `/`.

#### `deleteBannerWithImage(bannerId)`

Elimina un banner y su imagen asociada.

- Busca el banner en transaccion.
- Elimina la imagen en Cloudinary.
- Borra el registro en Prisma.
- Revalida `/admin/banners` y `/`.

#### `getBanners()`

Obtiene todos los banners ordenados por `order asc`.

#### `getBannerById(bannerId)`

Obtiene un banner por id o `null`.

#### `getBannersByPlacement(placement)`

Obtiene banners activos de un placement especifico, ordenados por `order asc`.

### Categorias

Archivo: `src/app/actions/category.action.ts`

Las mutaciones revalidan:

- `/admin/categorias`
- `/`
- `/categoria`
- `/sitemap.xml`

#### `createCategoryWithImage({ data, image? })`

Crea una categoria.

- Guarda `name`, `slug`, `description`.
- Si hay imagen, guarda `imageUrl` y `publicId`.
- Devuelve categoria serializada.

#### `updateCategoryWithImage(categoryId, data, image?)`

Actualiza una categoria existente.

- Busca la categoria en transaccion.
- Si no existe, devuelve error.
- Si hay nueva imagen, elimina la anterior de Cloudinary si tiene `publicId`.
- Actualiza datos e imagen.

#### `deleteCategoryWithImage(categoryId)`

Elimina una categoria.

- Busca categoria con conteo de productos asociados.
- Si tiene productos, bloquea la eliminacion.
- Si tiene imagen, la elimina de Cloudinary.
- Borra la categoria.

#### `getCategories()`

Obtiene categorias ordenadas por nombre e incluye `products`.

#### `getCategoryById(categoryId)`

Obtiene una categoria por id e incluye `products`.

### Productos

Archivo: `src/app/actions/product.action.ts`

Las mutaciones revalidan:

- `/admin/productos`
- `/`
- `/categoria`
- `/sitemap.xml`
- `/producto/[slug]` para slugs afectados

#### `createProductWithImages({ data, images })`

Crea producto, imagenes, variantes y talles/stock.

- Normaliza `colorHex`.
- Crea imagenes en orden.
- Crea variantes con sus talles y stock.
- Incluye categoria, imagenes, variantes y talles en la respuesta.

#### `getProducts()`

Obtiene todos los productos con categoria, imagenes, variantes y talles, ordenados por `createdAt desc`.

#### `getProductById(productId)`

Obtiene un producto por id con relaciones completas.

#### `getProductBySlug(productSlug)`

Obtiene un producto por slug con relaciones completas.

#### `deleteProductWithImages(productId)`

Elimina un producto y sus imagenes.

- Busca el producto.
- Obtiene sus imagenes.
- Elimina cada imagen de Cloudinary.
- Borra el producto.
- Revalida superficies relacionadas.

#### `updateProductWithImages(productId, data, existingImages, newImages)`

Actualiza producto, imagenes, variantes y talles.

- Borra de Cloudinary las imagenes removidas.
- Actualiza datos base del producto.
- Crea variantes nuevas.
- Actualiza variantes existentes.
- Crea o actualiza talles/stock.
- Si un talle removido ya tiene pedidos, no lo elimina: deja `stock: 0`.
- Si una variante removida ya tiene pedidos, no la elimina: deja stock de sus talles en `0`.
- Si una variante removida no tiene pedidos, la elimina.
- Agrega imagenes nuevas al final del orden actual.
- Revalida slug anterior y slug nuevo.

#### `getProductsForTable()`

Obtiene productos optimizados para la tabla admin.

- Incluye nombre de categoria.
- Incluye primera imagen.
- Incluye stock de talles.
- Ordena por `createdAt desc`.

#### `getFilteredProducts(filters)`

Obtiene productos activos para el listado publico.

Filtros soportados:

- `category`
- `gender`
- `size`
- `color`
- `maxPrice`
- `featured`
- `sale`
- `sort`

Detalles:

- Solo muestra productos activos.
- Solo considera variantes con stock mayor a `0`.
- Normaliza talle y color.
- `sale` compara `compareAtPrice > price`.
- Ordena con `newest`, `priceAsc`, `priceDesc` o `featured`.

#### `getPaginatedFilteredProducts({ page, pageSize, ...filters })`

Igual que `getFilteredProducts`, pero con paginacion.

- Limita `pageSize` entre `1` y `60`.
- Normaliza `page` a minimo `1`.
- Calcula `totalProducts`, `totalPages`, `currentPage` y `pageSize`.
- Devuelve productos serializados y metadata de paginacion.

Helpers internos relevantes:

- `revalidateProductPaths(slugs)`: revalida listados y paginas de producto afectadas.
- `buildFilteredProductsOrderBy(sort)`: convierte sort publico en `orderBy` Prisma.
- `buildFilteredProductsWhere(filters)`: convierte filtros publicos en `where` Prisma.

### Pedidos

Archivo: `src/app/actions/utils/orders.ts`

Las mutaciones revalidan:

- `/admin`
- `/admin/productos`
- `/admin/pedidos`
- `/`
- `/categoria`
- `/producto/[slug]` para productos afectados

#### `createOrderAction(data)`

Crea un pedido desde el carrito y reserva stock.

- Si no hay items, devuelve error.
- Normaliza items repetidos por `variantId-productSizeStockId`.
- Valida cantidades enteras y positivas.
- En transaccion:
  - busca cada talle/stock;
  - valida que pertenezca a la variante enviada;
  - valida que el producto siga activo;
  - descuenta stock con condicion `stock >= quantity`;
  - calcula total usando el precio actual del producto;
  - crea el pedido en estado `PENDING`.
- Revalida superficies afectadas.

#### `getAllOrders()`

Obtiene pedidos con items, variante, producto y talle/stock, ordenados por `createdAt desc`.

#### `getOrderById(orderId)`

Obtiene un pedido por id con sus relaciones principales.

#### `updateOrderStatusAction(formData)`

Adapter para formularios.

- Lee `orderId` y `status` desde `FormData`.
- Delega en `updateOrderStatusByIdAction`.

#### `updateOrderStatusByIdAction(orderId, status)`

Actualiza solo el estado del pedido.

- Si pasa a `CANCELLED`, restaura stock.
- Si sale de `CANCELLED`, intenta reservar stock nuevamente.
- Si no hay stock suficiente para reactivar, devuelve error.
- Revalida superficies afectadas.

#### `updateOrderAction(orderId, data)`

Actualiza nombre, telefono y estado de un pedido.

- Valida que nombre y telefono no queden vacios.
- Aplica la misma logica de stock que el cambio de estado.
- Actualiza datos del cliente y estado.
- Revalida superficies afectadas.

#### `deleteOrderAction(formData)`

Elimina un pedido.

- Lee `orderId` desde `FormData`.
- Si el pedido no estaba cancelado, restaura stock antes de eliminarlo.
- Borra el pedido.
- Revalida superficies afectadas.

Helpers internos relevantes:

- `revalidateOrderSurfaces(slugs)`: revalida admin, tienda y paginas de productos afectados.
- `getOrderForStockUpdate(tx, orderId)`: carga pedido con relaciones necesarias para stock.
- `restoreOrderStock(tx, order)`: incrementa stock de cada item del pedido.
- `reserveOrderStock(tx, order)`: descuenta stock para reactivar pedidos cancelados.
- `applyOrderStatusStockTransition(tx, orderId, nextStatus)`: decide si debe restaurar o reservar stock segun el cambio de estado.
