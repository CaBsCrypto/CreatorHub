# 📦 Guía de Migraciones y Base de Datos (CreatorHub / Browns Stats)

Este documento detalla la arquitectura de base de datos, el historial de migraciones de **Supabase**, cómo aplicarlas, cómo crear nuevas migraciones y las buenas prácticas para cualquier desarrollador o equipo que trabaje en la plataforma.

---

## 📑 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Ecosistema y Conexión](#-ecosistema-y-conexión)
3. [Cómo Aplicar Migraciones](#-cómo-aplicar-migraciones)
   - [Opción A: Supabase CLI (Recomendado)](#opción-a-supabase-cli-recomendado)
   - [Opción B: Supabase Dashboard (SQL Editor)](#opción-b-supabase-dashboard-sql-editor)
   - [Opción C: Entorno Local (Docker)](#opción-c-entorno-local-docker)
4. [Historial y Catálogo de Migraciones](#-historial-y-catálogo-de-migraciones)
5. [Políticas de Seguridad (RLS) y Roles](#-políticas-de-seguridad-rls-y-roles)
6. [Flujo de Trabajo para Nuevas Migraciones](#-flujo-de-trabajo-para-nuevas-migraciones)
7. [Checklist para el Nuevo Equipo / Setup](#-checklist-para-el-nuevo-equipo--setup)

---

## 🎯 Visión General

La base de datos de **CreatorHub / Browns Stats** está construida sobre **PostgreSQL** alojado en **Supabase**.
Toda la lógica de estructura de datos, extensiones, Row Level Security (RLS) y funciones RPC se gestiona mediante archivos SQL organizados cronológicamente en el directorio:

```
CreatorHub/
└── supabase/
    ├── config.toml           # Configuración del proyecto Supabase, Auth y Edge Functions
    ├── functions/            # Edge Functions (Deno / TypeScript)
    │   └── invite-user/      # Función serverless para invitar usuarios vía email
    └── migrations/           # Archivos SQL versionados (YYYYMMDD_nombre.sql)
```

---

## 🔌 Ecosistema y Conexión

### Variables de Entorno Requeridas
Las credenciales de Supabase se configuran en el archivo `.env`:

```env
# URL base de tu proyecto Supabase
VITE_SUPABASE_URL="https://<TU-PROJECT-REF>.supabase.co"

# Clave pública para el cliente frontend (respeta RLS)
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."

# Clave administrativa para backend/scripts/Vercel functions (omite RLS)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

> ⚠️ **Importante:** La `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe exponerse en el código del frontend (`src/`). Solo se utiliza en funciones serverless (`api/`, `server.ts`) o scripts administrativos.

---

## 🚀 Cómo Aplicar Migraciones

### Opción A: Supabase CLI (Recomendado)

Si tienes configurado el CLI de Supabase vinculado a tu proyecto remoto:

1. **Iniciar sesión en Supabase CLI:**
   ```bash
   npx supabase login
   ```

2. **Vincular el proyecto remoto:**
   ```bash
   npx supabase link --project-ref <TU-PROJECT-REF>
   ```

3. **Ver estado de migraciones remotas vs locales:**
   ```bash
   npx supabase migration list
   ```

4. **Empujar y aplicar migraciones pendientes a producción:**
   ```bash
   npx supabase db push
   ```

---

### Opción B: Supabase Dashboard (SQL Editor)

Si no cuentas con el CLI de Supabase configurado en tu máquina:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) y selecciona el proyecto de Browns Stats / CreatorHub.
2. En la barra lateral izquierda, dirígete a **SQL Editor**.
3. Abre el archivo de migración correspondiente desde `supabase/migrations/<nombre>.sql`.
4. Copia el contenido, pégalo en el editor y presiona **Run** (`Ctrl + Enter`).
5. Verifica que la consola indique `Success. No rows returned` o el resultado esperado.

---

### Opción C: Entorno Local (Docker)

Para desarrollar localmente con una instancia completa de Supabase en Docker:

```bash
# Iniciar contenedores de Supabase local
npx supabase start

# Las migraciones de supabase/migrations/ se aplicarán automáticamente
# Resetear base de datos local y reaplicar todas las migraciones:
npx supabase db reset

# Detener Supabase local
npx supabase stop
```

---

## 📚 Historial y Catálogo de Migraciones

A continuación se detalla el propósito de cada una de las migraciones existentes en el repositorio:

| # | Archivo | Módulo / Propósito |
|---|---|---|
| **01** | `20260320_payments.sql` | Crea la tabla `payments` para gestión y registro de pagos a creadores, montos y estados. |
| **02** | `20260320_guest_payments.sql` | Añade soporte para pagos a invitados (`guest_name`, `guest_email`, `guest_notes`). |
| **03** | `20260320_rls_cleanup.sql` | Limpieza de políticas RLS duplicadas o en conflicto. |
| **04** | `20260320_rls_complete_fix.sql` | Ajuste integral de permisos RLS en perfiles, campañas y contenido. |
| **05** | `20260320_rls_fix_admin.sql` | Corrige visibilidad y bypass de administradores en consultas directas. |
| **06** | `20260320_rls_hardening.sql` | Endurecimiento de seguridad RLS mediante funciones `SECURITY DEFINER` (`is_admin()`, `get_auth_user_role()`). |
| **07** | `20260322_scraper_logs.sql` | Tabla `scraper_logs` para auditar ejecuciones, éxitos y errores de scrapers y APIs de redes sociales. |
| **08** | `20260322_twitch_metrics.sql` | Soporte de métricas básicas de Twitch en contenidos. |
| **09** | `20260322_twitch_extra_metrics.sql` | Columnas adicionales para transmisiones y VODs de Twitch. |
| **10** | `20260322_unique_chatters.sql` | Métricas de chatters únicos para streams de Twitch. |
| **11** | `20260322_unique_viewers.sql` | Métricas de espectadores únicos en directos. |
| **12** | `20260323_audit_logs.sql` | Tabla `audit_logs` para registrar acciones administrativas críticas e historial de auditoría. |
| **13** | `20260325_campaign_updates.sql` | Campos extendidos para campañas (presupuestos, fechas de inicio/fin y metas). |
| **14** | `20260325_fix_audit_logs_relationship.sql` | Foreign key entre `audit_logs` y la tabla `profiles` para joins en el frontend. |
| **15** | `20260326_share_links.sql` | Tabla `share_links` para generación de enlaces públicos de revisión de campañas/contenidos sin login. |
| **16** | `20260327_fix_log_admin_action.sql` | Función RPC optimizada para registrar logs de administración de manera segura. |
| **17** | `20260331_content_history.sql` | Tabla `content_metric_history` para snapshots diarios de métricas (vistas, likes, comentarios, engagement). |
| **18** | `20260401_discord_schema.sql` | Esquema para webhooks y notificaciones automáticas hacia Discord. |
| **19** | `20260406_scraper_logs_rls_fix.sql` | Permisos RLS para permitir inserción de logs desde el servicio serverless / roles anónimos autorizados. |
| **20** | `20260609_add_show_to_all_to_campaigns.sql` | Columna `show_to_all` (booleano) para hacer visibles ciertas campañas a todos los creadores. |
| **21** | `20260610_alter_platform_check_constraint.sql` | Expande el check constraint de `platform` para admitir Twitter/X, TikTok, Instagram, YouTube, Twitch, etc. |
| **22** | `20260612_add_reposts_and_content_type.sql` | Soporte para métricas de reposts y clasificación por tipo de formato de contenido. |
| **23** | `20260707_rls_hardening_and_views.sql` | Vistas SQL agregadas (`v_campaign_stats`, etc.) y endurecimiento final de políticas RLS. |
| **24** | `20260910_creator_groups.sql` | Tablas de grupos de creadores (`creator_groups`, `creator_group_members`) para asignación colectiva. |
| **25** | `20260919_demo_requests.sql` | Tabla y RLS para almacenar solicitudes de demostración enviadas desde la landing page pública. |
| **26** | `20260919_post_tracking_enhancements.sql` | **Tracking Multiplataforma**: campos `master_post_id`, `platform_id`, estados de acople y sincronización multi-red. |
| **27** | `20260919_tellus_campaign_and_rls.sql` | Campaña y políticas específicas de visualización segura para el portal de clientes Tellus. |

---

## 🔒 Políticas de Seguridad (RLS) y Roles

Supabase utiliza **Row Level Security (RLS)** activado en todas las tablas sensibles (`profiles`, `campaigns`, `content`, `payments`, `audit_logs`).

### Roles de Usuario en la Plataforma
1. **`admin`**: Acceso total de lectura y escritura en todas las tablas y configuraciones.
2. **`client`**: Acceso de solo lectura a las campañas y contenidos explícitamente asignados a su cuenta o workspace.
3. **`creator`**: Acceso para ver sus asignaciones, subir entregables y ver sus métricas de rendimiento.

### Funciones de Seguridad Clave (Security Definer)
- `is_admin()`: Valida si el usuario autenticado (`auth.uid()`) posee el rol de administrador en la tabla `profiles`.
- `get_auth_user_role()`: Retorna el rol del usuario actual sin provocar recursión infinita en las políticas RLS.

---

## 🛠️ Flujo de Trabajo para Nuevas Migraciones

Cuando necesites realizar cambios en la base de datos (crear tablas, agregar columnas, cambiar índices o políticas):

1. **Crear el archivo de migración con el formato estándar:**
   ```bash
   npx supabase migration new nombre_descriptivo_del_cambio
   ```
   Esto generará un archivo en `supabase/migrations/YYYYMMDDHHMMSS_nombre_descriptivo_del_cambio.sql`.

2. **Reglas para escribir el SQL:**
   - **Idempotencia:** Usa siempre `IF NOT EXISTS` o `IF EXISTS` para evitar fallos si el script se vuelve a correr.
   - **No romper compatibilidad:** Si agregas una columna nueva a una tabla existente, usa un valor por defecto (`DEFAULT ...`) o permítela nullable.
   - **Configurar RLS:** Si creas una tabla nueva, siempre incluye:
     ```sql
     ALTER TABLE mi_nueva_tabla ENABLE ROW LEVEL SECURITY;
     ```
   - **Documentar:** Agrega un comentario en la cabecera explicando el motivo del cambio y qué PR o ticket resuelve.

3. **Probar y commitear:**
   - Prueba localmente o en un proyecto de staging.
   - Agrega el archivo a Git (`git add supabase/migrations/...`).
   - Envía el commit a la rama de trabajo.

---

## ✅ Checklist para el Nuevo Equipo / Setup

Al instalar el proyecto en una nueva computadora o clonarlo por primera vez:

- [ ] Clonar repositorio: `git clone https://github.com/CaBsCrypto/CreatorHub.git`
- [ ] Instalar paquetes: `npm install`
- [ ] Configurar `.env` (o descargarlo automáticamente con `npx vercel env pull .env`)
- [ ] Comprobar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` conectan correctamente.
- [ ] Si se requiere invitar usuarios o administración de backend, asegurar `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Verificar que la base de datos remota tenga todas las migraciones al día (`npx supabase db push` o revisar catálogo).
- [ ] Iniciar entorno de desarrollo: `npm run dev`.
