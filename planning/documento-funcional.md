# Documento Funcional — Sistema de Gestión de Gimnasio

> Qué puede hacer el sistema hoy y qué queda para más adelante.
> Fase 1 (MVP entregado) · Fase 2 (mejoras ya implementadas) · Fase 3 (ideas futuras).

## 1. ¿Qué es este sistema?

Es una aplicación web pensada para que el dueño o entrenador de un gimnasio gestione
todo su día a día desde un solo lugar: los datos de sus clientes, sus fichas médicas,
las rutinas de entrenamiento y los pagos. Antes esa información solía estar repartida
entre planillas, papeles y mensajes; el sistema la centraliza y automatiza la tarea
que más tiempo consume: armar rutinas de entrenamiento para cada cliente.

El sistema está pensado para que lo use una sola persona (el propio entrenador/dueño),
por lo que no incluye manejo de distintos perfiles de usuario ni permisos. Sí está
diseñado para poder crecer en el futuro hacia otras necesidades (por ejemplo, varios
gimnasios o sedes), aunque eso todavía no forma parte de lo construido.

## 2. Estado actual

- **Fase 1 (MVP):** entregada y funcionando.
- **Fase 2 (mejoras sobre el MVP):** entregada y funcionando. Varias ideas que
  originalmente se habían planteado "para más adelante" ya están implementadas.
- **Fase 3 (futuro):** ideas pendientes, todavía no construidas.

La interfaz está disponible en **español (por defecto) e inglés**, con selector de
idioma.

---

## 3. Fase 1 — MVP (entregado)

### Acceso seguro al sistema
*Que solo vos puedas ver la información de tus clientes, sus datos médicos y sus pagos.*
- Ingresás con tu usuario y contraseña.
- Si te olvidás la contraseña, la recuperás por email.
- La sesión queda abierta sin pedirte que vuelvas a loguearte todo el tiempo.

### Gestión de clientes
*Toda la información básica de cada persona que entrena con vos, en un solo lugar.*
- Alta de un cliente con sus datos: nombre, DNI, teléfono, email, fecha de nacimiento,
  dirección, objetivo y un contacto de emergencia.
- Ver, editar y buscar clientes por nombre.
- Filtrar la lista por clientes activos o inactivos.
- Baja lógica: si un cliente deja de venir, lo marcás como inactivo sin perder su
  historial (pagos, rutinas, ficha médica).

### Ficha médica del cliente
*Diseñar rutinas seguras y estar preparado ante una emergencia.*
- Cargar y actualizar condiciones preexistentes, lesiones, cirugías o prótesis,
  restricciones físicas, medicación habitual, alergias, grupo sanguíneo y notas.
- No es obligatoria al dar de alta; se puede cargar después.

### Catálogo de ejercicios
*Armar rutinas más rápido, sin escribir cada ejercicio desde cero.*
- Viene precargado con ejercicios comunes y vas sumando los que necesites.
- Cada ejercicio tiene nombre, grupo muscular, series/repeticiones sugeridas, técnica
  de ejecución y equipamiento.
- Se clasifican como de movilidad, de activación (calentamiento) o principales.

### Plantillas de rutina reutilizables
*La funcionalidad clave que más tiempo ahorra: armás una rutina una vez y la reutilizás.*
- Plantillas con nombre, objetivo y notas generales de técnica.
- Cada plantilla puede tener varias sesiones (por ejemplo A, B y C).
- Cada sesión incluye entrada en calor (movilidad y activación) y ejercicios
  principales con series, repeticiones y peso sugerido.
- Duplicar una plantilla existente para adaptarla rápido a otro cliente.

### Asignación de rutinas a clientes
*Que cada cliente tenga siempre una rutina activa y sepas cuándo renovarla.*
- Asignar a un cliente una rutina basada en una plantilla, con fecha de inicio y
  duración.
- Ajustar esa rutina para el cliente sin modificar la plantilla original.
- Una sola rutina activa por cliente, con consulta de las anteriores.

### Registro de pagos
*Saber quién pagó, cuánto y de qué mes, sin depender de anotaciones sueltas.*
- Registrar un pago: monto, fecha, medio (efectivo, transferencia o tarjeta) y el mes
  que cubre.
- Corregir o eliminar un pago cargado por error.
- El sistema indica automáticamente si un cliente está al día o tiene un pago vencido.

### Historial de pagos por cliente
*Resolver dudas sobre pagos pasados y entregar un comprobante.*
- Ver el historial completo de pagos de cada cliente.
- Exportar o imprimir ese historial en PDF.

### Panel principal con avisos
*Ver de un vistazo qué necesita tu atención hoy, sin revisar cliente por cliente.*
- Al entrar, un panel muestra los clientes con pago vencido o por vencer y los que
  tienen la rutina vencida o por vencer.
- Desde el panel se va directo al perfil del cliente para resolverlo.

---

## 4. Fase 2 — Mejoras ya implementadas (sobre el MVP)

Estas funcionalidades se habían planteado originalmente "para más adelante" y **ya
están construidas y en uso**.

- **Recordatorios automáticos por email**: avisos de pagos/rutinas próximos a vencer,
  con envío programado y sin duplicar el mismo aviso. *(El canal WhatsApp queda para
  Fase 3.)*
- **Control de asistencia**: registrar el check-in de un cliente cuando viene a
  entrenar.
- **Seguimiento de progreso físico**: mediciones con fecha (peso, % de grasa y medidas
  corporales), notas y **fotos de progreso** para ver la evolución en el tiempo.
- **Planes de nutrición**: además de las rutinas, un plan de comidas por cliente
  (calorías, objetivo de proteína, comidas y alimentos), con historial de versiones.
- **Filtrar el listado de clientes por estado de pago** (al día / vencido / sin pagos).
- **Historial de cambios de la ficha médica** a lo largo del tiempo.
- **Imágenes y video de referencia en los ejercicios** del catálogo (imagen y enlace a
  video). *(La subida nativa de video queda para Fase 3.)*
- **Sugerencias según la ficha médica**: avisos de ejercicios a considerar/evitar y
  sugerencias de calentamiento según las condiciones del cliente.
- **Progresión automática de peso/series** a lo largo de varias semanas dentro de una
  misma rutina.
- **Vista resumen del historial de pagos** (total pagado, meses adeudados) además del
  listado.
- **Indicadores generales en el panel** (KPIs: clientes activos, ingresos del mes, etc.).
- **Exportación de rutinas a PDF y Excel** con el formato de planilla del entrenador
  (progresión semanal incluida).
- **Interfaz bilingüe (español / inglés)** con selector de idioma y refresco visual de
  toda la aplicación.

---

## 5. Fase 3 — Ideas para más adelante (pendientes)

Todavía no construidas; se evaluarán en una etapa posterior.

- **Cobro online integrado** (por ejemplo Mercado Pago o similar), en vez de la carga
  manual del pago.
- **Recordatorios por WhatsApp** (además del email ya disponible).
- **Subida nativa de video** de ejercicios (hosting gestionado de los archivos, en vez
  de solo enlaces).
- **Soporte para varios gimnasios o sedes** desde un mismo sistema (multi-tenant, con
  perfiles y permisos de usuario).
