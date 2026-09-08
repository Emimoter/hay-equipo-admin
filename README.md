# ⚽ Hay Equipo — Plataforma Deportiva (Web & Mobile)

> Plataforma multi-deporte (Pádel, Fútbol 5/7/8/11) para gestión de turnos, reservas en tiempo real, división de pagos (*split payments*), pasaporte y ficha deportiva personalizable.

**🌐 Producción activa:** [https://hay-equipo-admin.vercel.app](https://hay-equipo-admin.vercel.app)

---

## 📂 ¿Cómo está organizado el proyecto? (Estructura de Carpetas)

Este proyecto está configurado como un **Monorepo** (un único repositorio que contiene tanto la aplicación web como la aplicación móvil y la lógica compartida):

```text
hay-equipo-admin/
│
├── 📱 apps/                         # Aplicaciones cliente principales
│   ├── web-club/                   # Web Next.js 14: Panel del club, reservas, ficha de jugador, pago dividido
│   ├── mobile/                     # App Mobile React Native + Expo para iOS y Android
│   └── web-public/                 # Landing comercial y fallback público de pagos
│
├── 📦 packages/                     # Paquetes y lógica compartida entre Web y Mobile
│   ├── contracts/                  # Tipos TypeScript y esquemas Zod (perfil, reservas, partidos)
│   ├── api/                        # Servicios y endpoints de backend
│   ├── db/                         # Esquemas de base de datos y modelos
│   └── redis/                      # Manejo de caché y bloqueos atómicos
│
├── 📚 docs/                         # Documentación técnica de arquitectura y base de datos
│   ├── ARCHITECTURE.md             # Flujos del sistema, mapas y deep links
│   ├── API_DOCUMENTATION.md        # Especificación de endpoints
│   └── DATABASE_SCHEMA.md          # Estructura de colecciones y datos
│
├── 🎨 DESIGN_SYSTEM.md              # Tokens de diseño: colores (Void, Obsidian, Crimson), tipografía y componentes
├── 📋 AGENTS.md                     # Reglas de diseño estricto (geometría dual 90°/píldoras, zero-emoji)
└── ⚙️ package.json                  # Scripts y dependencias del monorepo
```

---

## 🛠️ Tecnologías Principales

- **Web:** Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS.
- **Mobile:** React Native con Expo (iOS & Android).
- **Backend & Base de datos:** Firebase (Firestore, Auth, Storage) y API Fastify/Node.js.
- **Pagos:** Mercado Pago (Checkout Pro y división de pagos entre compañeros).
- **Diseño UI/UX:** Swiss Brutalist / Dark Obsidian, tipografía Space Grotesk, 100% iconos vectoriales SVG.

---

## 🚀 Guía Rápida para Desarrolladores

### 1. Requisitos Previos
- Node.js 18+ instalado
- npm o pnpm

### 2. Instalación de dependencias
Desde la carpeta raíz:
```bash
npm install
```

### 3. Compilar los paquetes compartidos
```bash
npm run build:packages
```

### 4. Levantar la aplicación Web (Local)
```bash
npm run dev:web-club
```
La aplicación web estará disponible en `http://localhost:3000`.

### 5. Compilar para Producción
```bash
npm run build
```

---

## 📌 Páginas y Rutas Clave de la Web

- `/reservar`: Selección de cancha, clubes disponibles, turnos y ficha personalizable de jugador.
- `/panel`: Panel de administración del club con grilla de turnos fijos y reservas en vivo.
- `/split/[token]`: Sala de pago compartido entre jugadores con ficha táctica de los participantes.
- `/jugador/[id]`: Perfil público compartible para mostrar nivel, posición y estadísticas deportivas.

---

## 📄 Licencia
Privado — Propiedad de Hay Equipo © 2026. Todos los derechos reservados.
