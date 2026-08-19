# Arquitectura del Sistema: Hay Equipo

Hay Equipo es una plataforma mobile-first multi-deporte (iniciando con Pádel y Fútbol 5/7/8/11 en Argentina, expandible a Tenis, Pickleball, Básquet, Vóley, Hockey, Squash) que resuelve el circuito completo:

**BUSCAR → DISPONIBILIDAD REAL → RESERVAR (<30s) → PAGAR (Mercado Pago) → DIVIDIR (Split) → INVITAR (WhatsApp) → REPETIR / TURNOS FIJOS**

---

## 1. Componentes del Monorepo

- **`apps/mobile`**: Aplicación móvil para jugadores en **React Native + Expo (Expo Router)** para **iOS y Android**.
- **`apps/web-club`**: Panel responsive del Club (Next.js 14) con agenda en tiempo real, carga de reservas manuales de mostrador/WhatsApp, administración de turnos fijos y CRM de clientes.
- **`apps/web-public`**: Landing SEO indexable y **Web Fallback de Split Payments** para que amigos invitados paguen sin instalar la app obligatoriamente.
- **`packages/api`**: Backend REST & SSE (Fastify/Node.js + TypeScript) con motor de disponibilidad y reservas.
- **`packages/contracts`**: Schemas Zod y tipos compartidos para validación end-to-end.
- **`packages/db`**: Esquema Prisma PostgreSQL y almacén de datos con semillas reales de clubes de Argentina.
- **`packages/redis`**: Bloqueo atómico distribuido (`HELD` de 7 min) para prevenir dobles reservas.

---

## 2. Estrategia Cross-Platform iOS y Android

| Dimensión | Enfoque Técnico |
| :--- | :--- |
| **Framework** | React Native + Expo Managed Workflow con TypeScript. |
| **Pagos Store Compliance** | Mercado Pago Checkout Pro via SFSafari / Custom Tabs. Servicios del mundo real exentos del 30% IAP. |
| **Mapas** | `react-native-maps` con pines de precio dinámico y deep links inteligentes a Waze/Maps. |
| **Deep Links** | Universal Links (`applinks:hayequipo.com`) y Android App Links con autoVerify. |
| **Notificaciones** | APNs + FCM (Expo Notifications) para recordatorios a 24h y 2h antes del partido. |
| **Design System** | Dark mode deportivo (Negro carbón `#0B0F17`, Superficie `#161F30`, Verde Eléctrico `#22C55E`). |
