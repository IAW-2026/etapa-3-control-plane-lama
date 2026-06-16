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

## Estado segun contrato actual

- `Seller App` permite listar vendedores, productos y ordenes, y ver detalle de orden.
- `Shipping App` permite consultar un envio por orden, pero no listar todos los envios.
- `Buyer App` permite listar compradores y expone checkout por orden.
- `Payments App` no expone listado administrativo de pagos ni disputas en el contrato actual.

Por eso:

- `pagos` usa el estado de pago reportado por Seller App;
- `envios` se arma a partir de ordenes de Seller App y consultas por orden a Shipping App;
- `usuarios` muestra compradores reales de Buyer App y vendedores reales de Seller App;
- `disputas` queda bloqueado hasta que Payments publique ese endpoint;
- no se ofrece activar o desactivar vendedores porque ese endpoint no existe en el contrato recibido.

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

CONTROL_PLANE_API_KEY=
API_REQUEST_TIMEOUT_MS=8000
```

Las llamadas internas envian `x-service-name` con el servicio destino (`buyer`, `seller`, `shipping` o `payments`) y `x-api-key` con la variable `*_API_KEY` correspondiente. `CONTROL_PLANE_API_KEY` queda como fallback si no existe una clave especifica para el servicio.

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

- Buyer App: `GET /api/compradores`, `GET /api/ordenes/{orden_id}/checkout`
- Seller App: `GET /api/vendedores`, `GET /api/productos`, `GET /api/ordenes-ventas`, `GET /api/ordenes-ventas/{orden_id}`
- Shipping App: `GET /api/envios/orden/{orden_id}`
- Payments App: sin endpoints administrativos de listado en el contrato actual
