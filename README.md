# LAMA Control Plane

Webapp administrativa global del sistema LAMA, marketplace de moda circular.

El Control Plane funciona como un panel unico para que un superadministrador pueda operar sobre las distintas apps del ecosistema desde un mismo lugar. No reemplaza los paneles individuales de Buyer App, Seller App, Shipping App ni Payments App, sino que los complementa con una vista centralizada y de mayor nivel.

Link a la app: 

## Funcionalidades principales

- Vision consolidada de usuarios, productos, ordenes, envios y pagos.
- Acciones de gestion sobre las apps conectadas, como editar usuarios, activar o desactivar cuentas y revisar estados operativos.
- Comunicacion con las APIs de cada webapp para consultar y coordinar informacion administrativa.
- Acceso protegido con Clerk y validacion de rol `super_admin`.

## Alcance

La app concentra informacion administrativa de las distintas partes del sistema y facilita la supervision global del marketplace. Cada accion depende de los endpoints disponibles en las APIs individuales.
