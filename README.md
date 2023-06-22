# Gestor de Inventario de Vidrios - Uveg

¡Bienvenido al repositorio del Gestor de Inventario de Vidrios para la empresa Uveg! Este proyecto te permite llevar un registro detallado del inventario de vidrios, así como gestionar diversas operaciones relacionadas con ellos, como crear, editar, eliminar, mover y consumir unidades de vidrios. El sistema también proporciona funcionalidades adicionales, como la gestión de materiales, proveedores, usuarios y roles.
## Características principales
- Registro de vidrios: puedes agregar nuevos vidrios al inventario proporcionando detalles como material, posición, proveedor, ancho, alto, cantidad por paquete, lote y fecha de vencimiento.
- Gestión de materiales: puedes crear, editar y eliminar materiales utilizados para los vidrios.
- Gestión de proveedores: puedes agregar, modificar y eliminar proveedores asociados a los vidrios.
- Registro de cambios: el sistema registra quién realizó cada cambio en los vidrios y cuándo se realizó.
- Sistema de inicio de sesión: cuenta con un sistema de autenticación que permite a los usuarios acceder a sus cuentas y protege los datos del inventario.
- Gestión de roles: se implementa un sistema de roles con dos niveles: usuario y administrador. Los usuarios tienen acceso limitado, mientras que los administradores tienen permisos completos para administrar el inventario y los usuarios.
## Tecnologías utilizadas 
- [Next.js](https://nextjs.org/) : un framework de React para crear aplicaciones web modernas del lado del servidor y del cliente. 
- [NextAuth](https://next-auth.js.org/) : una biblioteca de autenticación flexible y fácil de usar para Next.js. 
- [React](https://reactjs.org/) : una biblioteca de JavaScript para construir interfaces de usuario interactivas. 
- [Tailwind CSS](https://tailwindcss.com/) : un framework de CSS utilitario que facilita la creación de interfaces elegantes y personalizables. 
- [TypeScript](https://www.typescriptlang.org/) : un lenguaje de programación que agrega tipos estáticos a JavaScript, lo que mejora la calidad y mantenibilidad del código. 
- [Prisma](https://www.prisma.io/) : un ORM (Object-Relational Mapping) para bases de datos modernas que proporciona una forma fácil y segura de interactuar con la base de datos. 
- [Planetscale](https://planetscale.com/) : una plataforma de bases de datos relacionales en la nube que proporciona una administración y escalabilidad confiables. 
- [Material-UI](https://mui.com/)  y [Headless UI](https://headlessui.dev/) : bibliotecas de componentes de interfaz de usuario que facilitan la creación de interfaces atractivas y accesibles.
## Despliegue

El sitio web del Gestor de Inventario de Vidrios se encuentra alojado en Vercel, una plataforma de implementación y alojamiento de aplicaciones web. La base de datos utiliza Planetscale con la plataforma de datos de Prisma para garantizar un almacenamiento seguro y escalable.

Para configurar y ejecutar el proyecto localmente, sigue estos pasos:
1. Clona este repositorio en tu máquina local.
2. Asegúrate de tener Node.js instalado en tu entorno. 
3. Instala las dependencias del proyecto ejecutando el comando `npm install`.
4. Configura las variables de entorno necesarias para la conexión con la base de datos y otros ajustes del sistema. 
5. Ejecuta el proyecto en tu entorno de desarrollo local utilizando el comando `npm run dev`.

Recuerda consultar la documentación de cada tecnología utilizada para obtener más detalles sobre su configuración y uso.
## Contribución

Si deseas contribuir a este proyecto, ¡estaremos encantados de recibir tus aportes! Puedes hacerlo mediante la apertura de pull requests y reportando problemas a través del sistema de seguimiento de problemas.

Antes de enviar tus cambios, asegúrate de que todas las pruebas pasen satisfactoriamente y sigue las pautas de estilo de código establecidas.
## Licencia

Este proyecto se distribuye bajo la licencia MIT. Puedes consultar el archivo [LICENSE](https://chat.openai.com/LICENSE)  para obtener más información.---

Esperamos que este Gestor de Inventario de Vidrios sea de gran utilidad para la empresa Uveg y ayude a mejorar la gestión de su inventario. Si tienes alguna pregunta o sugerencia, no dudes en comunicarte con el equipo de desarrollo. ¡Gracias por tu interés en nuestro proyecto!
