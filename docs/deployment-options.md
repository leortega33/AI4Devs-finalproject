# Opciones de despliegue y URL pública

Guía de referencia para exponer la app (frontend + API single-origin) con una URL
accesible. Resume las alternativas evaluadas, sus costos reales y los pasos
concretos de cada una. El código/comandos van en inglés; las notas en español.

> Contexto de la app: se sirve todo en un mismo origen bajo un contenedor de
> producción (`docker-compose.prod.yml`), con volúmenes para PostgreSQL y para las
> fotos de progreso (`/data/photos`). Ver `render.yaml`, `scripts/prod-start.sh` y
> `scripts/prod-stop.sh`.

## Resumen de opciones

| Opción | URL fija | Costo real | Tu PC encendida | Fotos/DB persistentes | Cuándo usarla |
|---|---|---|---|---|---|
| A. Cloudflare Quick Tunnel (actual) | ❌ (cambia al reiniciar) | $0 | ✅ | ✅ (volúmenes locales) | Demos puntuales; pasar la URL al momento |
| B. Cloudflare Named Tunnel | ✅ | ~costo de un dominio (~10 USD/año) | ✅ | ✅ (volúmenes locales) | URL estable propia manteniendo el hosting en tu equipo |
| C. Render (free) | ✅ (`*.onrender.com`) | $0 con límites | ❌ | ❌ (DB free caduca ~30 días; sin disco persistente → se pierden fotos) | Demo corta con URL fija sin importar perder fotos |
| D. Railway / Fly.io | ✅ | No es $0 continuo (Railway ~5 USD/mes; Fly pago-por-uso con tarjeta) | ❌ | ✅ (volumen) | Uso más estable si se acepta pagar |

Recomendación por defecto: **Opción A** (gratis y conserva DB + fotos). Si se
necesita URL fija sin pagar dominio y no importa perder fotos, **Opción C**.

---

## Opción A — Cloudflare Quick Tunnel (actual, gratis)

URL efímera `https://<random>.trycloudflare.com` que cambia cada vez que se
reinicia `cloudflared`. Ya está automatizado en los scripts.

```bash
# Levantar stack de producción + túnel e imprimir la URL vigente
./scripts/prod-start.sh

# Bajar el túnel y el stack (agrega -v para borrar volúmenes)
./scripts/prod-stop.sh
```

- No requiere cuenta ni dominio.
- La máquina debe quedar encendida mientras se comparte la URL.
- Copiar la URL que imprime el script y enviarla cuando la pidan.

---

## Opción B — Cloudflare Named Tunnel (URL fija, requiere dominio)

Túnel con nombre persistente mapeado a un subdominio propio. La URL **no cambia**
aunque se reinicie. Requiere un dominio gestionado en Cloudflare (DNS).

Requisitos: cuenta de Cloudflare + un dominio agregado a Cloudflare +
`cloudflared` instalado (`brew install cloudflared`).

```bash
# 1) Autenticar cloudflared con la cuenta de Cloudflare (abre el navegador)
cloudflared tunnel login

# 2) Crear un túnel con nombre persistente (guarda credenciales en ~/.cloudflared)
cloudflared tunnel create gym

# 3) Crear el registro DNS que apunta el subdominio al túnel
cloudflared tunnel route dns gym gym.tudominio.com
```

Crear `~/.cloudflared/config.yml`:

```yaml
tunnel: gym
credentials-file: /Users/<user>/.cloudflared/<TUNNEL-UUID>.json
ingress:
  - hostname: gym.tudominio.com
    service: http://localhost:8080   # puerto expuesto por el contenedor de prod
  - service: http_status:404
```

```bash
# 4) Levantar el stack de producción (sin el quick tunnel) y luego el named tunnel
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
cloudflared tunnel run gym
```

- HTTPS automático gestionado por Cloudflare.
- La máquina/Docker siguen siendo el host: deben estar encendidos.
- Único costo: el dominio.

---

## Opción C — Render (URL fija gratis, con límites)

Da `https://<service>.onrender.com` sin pagar dominio. El repo ya incluye
`render.yaml`.

Pasos:
1. Crear cuenta en Render y conectar el repositorio de GitHub.
2. Render detecta `render.yaml` (Blueprint) y crea el servicio web + la base de
   datos definidos.
3. Configurar las variables de entorno (secretas) en el panel de Render
   (por ejemplo `JWT_SECRET`, credenciales de DB, `RESEND_API_KEY` si aplica).
   No subir secretos al repo.
4. Deploy. La URL queda fija.

Limitaciones importantes del plan gratuito (verificar antes de depender de él):
- El servicio **se duerme** tras inactividad (~15 min) y tarda unos segundos en
  despertar en la primera petición.
- El **PostgreSQL gratuito caduca** (aprox. 30 días) y luego se elimina.
- **No hay disco persistente** en free → las **fotos de progreso se pierden** en
  cada redeploy/reinicio. En `render.yaml` ya está anotado que el FS es efímero
  (`PHOTO_STORAGE=local`, `PHOTO_STORAGE_DIR=/data/photos`); para persistir fotos
  se necesita un disco de pago.

Adecuado para una demo corta con URL fija donde perder fotos/DB no es crítico.

---

## Opción D — Railway / Fly.io (URL fija, de pago)

Ambos dan subdominio fijo y volúmenes persistentes, pero **no son $0 continuos**:
- **Railway**: crédito de prueba único (~5 USD), luego plan Hobby (~5 USD/mes).
- **Fly.io**: requiere tarjeta y es pago-por-uso; una app chica es barata pero no
  gratuita.

Flujo general (Railway como ejemplo):
1. Crear proyecto y conectar el repo.
2. Añadir un servicio PostgreSQL (con volumen) y el servicio web (Dockerfile de
   prod).
3. Definir variables de entorno y un volumen para `/data/photos`.
4. Deploy; la URL fija queda disponible.

Recomendado solo si se acepta el costo a cambio de URL fija + persistencia real.

---

## Notas de seguridad

- Nunca commitear `.env.prod` ni secretos; se configuran en el panel del proveedor
  o en variables de entorno locales.
- Rotar `JWT_SECRET` y credenciales si se compartieron en algún entorno de prueba.
- En cualquier opción con hosting propio (A/B), mantener el sistema operativo y
  Docker actualizados.
