# LAMA Control Plane

Webapp administrativa global para el Proyecto IAW 2026, tipo C Marketplace.

El Control Plane no reemplaza los paneles admin de Buyer App, Seller App, Shipping App ni Payments App. Su rol es consultar y orquestar esas APIs para que un superadministrador tenga una vision consolidada del ecosistema LAMA, marketplace de moda circular.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk para autenticacion
- Deploy preparado para Vercel
- PostgreSQL/Supabase no es requerido en esta base; puede agregarse si se necesita persistir configuracion propia del Control Plane.

## Funcionalidad inicial

- Login/logout con Clerk.
- Proteccion de rutas privadas por rol `super_admin`.
- Layout administrativo con sidebar/navbar.
- Dashboard con KPIs consolidados.
- Paginas: usuarios, productos, ordenes, envios, pagos, disputas y configuracion.
- Clientes API centralizados en `lib/services`.
- Busqueda y paginacion por URL donde el contrato la soporta.
- Detalle de orden consolidando Seller, Buyer, Payments y Shipping cuando existen endpoints.
- Copiloto administrativo de solo lectura con Gemini.
- Alertas auditables para detectar inconsistencias operativas y valores atipicos.

## Estado segun contrato actual

- `Seller App` permite listar vendedores, editar vendedores, actualizar el estado de un vendedor, listar productos y ordenes, y ver detalle de orden.
- `Shipping App` permite consultar un envio por orden, pero no listar todos los envios.
- `Buyer App` permite listar compradores, editar compradores, actualizar el estado de un comprador y expone checkout por orden.
- `Payments App` permite listar pagos para el rol `super_admin`; las disputas siguen sin endpoint administrativo.

Por eso:

- `pagos` consulta el listado real de Payments App e informa si cada pago fue liquidado;
- `envios` se arma a partir de ordenes de Seller App y consultas por orden a Shipping App;
- `usuarios` muestra compradores reales de Buyer App y vendedores reales de Seller App, y permite editar, activar o desactivar compradores y vendedores;
- `disputas` queda bloqueado hasta que Payments publique ese endpoint;

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_SUPER_ADMIN_ROLE=super_admin

BUYER_API_URL=
BUYER_APP_URL=
BUYER_API_KEY=
SELLER_API_URL=
SELLER_APP_URL=
SELLER_API_KEY=
SHIPPING_API_URL=
SHIPPING_APP_URL=
SHIPPING_API_KEY=
PAYMENTS_API_URL=
PAYMENTS_APP_URL=
PAYMENTS_API_KEY=

INTERNAL_API_KEY=
CONTROL_PLANE_API_KEY=
API_REQUEST_TIMEOUT_MS=8000

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` se usa exclusivamente en el servidor. Sin esa variable, las alertas siguen
funcionando y la interfaz del copiloto informa que falta configuracion.

Las llamadas administrativas internas envian `x-service-name: control-plane` y `x-api-key` con `INTERNAL_API_KEY`; `CONTROL_PLANE_API_KEY` queda como fallback de compatibilidad. Si un servicio requiere una key propia, el cliente tambien soporta `*_API_KEY`.

## Rol requerido

El usuario de Clerk debe tener el rol `super_admin` en metadata o claims. La app revisa estas ubicaciones:

- `publicMetadata.role`
- `publicMetadata.roles`
- `privateMetadata.role`
- `privateMetadata.roles`
- `sessionClaims.metadata.role`
- `sessionClaims.metadata.roles`
- `sessionClaims.role`

## Correr localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Contratos de API usados

- Buyer App: `GET /api/compradores`, `PATCH /api/compradores/{clerk_user_id_comprador}`, `PATCH /api/compradores/{clerk_user_id_comprador}/estado`, `GET /api/ordenes/{orden_id}/checkout`
- Seller App: `GET /api/vendedores`, `PATCH /api/vendedores/{clerk_user_id}`, `PATCH /api/vendedores/{clerk_user_id}/estado`, `GET /api/productos`, `GET /api/ordenes-ventas`, `GET /api/ordenes-ventas/{orden_id}`
- Shipping App: `GET /api/envios/orden/{orden_id}`
- Payments App: `GET /api/pagos?rol=super_admin`

El `PATCH /api/compradores/{clerk_user_id_comprador}` recibe `{ "nombre_comprador": string, "email": string, "telefono": string, "direccion_envio": string }`.
El `PATCH /api/compradores/{clerk_user_id_comprador}/estado` recibe `{ "activo": true | false }`.
