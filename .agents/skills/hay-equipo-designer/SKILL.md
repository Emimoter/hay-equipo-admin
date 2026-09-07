---
name: hay-equipo-designer
description: The single source of truth for Hay Equipo reusable vector SVG iconography, sports pitch blueprints, photography overlay rules, and badge tokens across Web and Mobile.
---

# HAY EQUIPO DESIGNER & ASSET REPOSITORY

> **AUTHORITATIVE DIRECTIVE:**  
> This skill is the central visual asset library for the **Hay Equipo** ecosystem.  
> Whenever an interface requires icons, court representations, photo overlays, or status badges, developers and AI agents MUST pull directly from these vetted SVG definitions.  
> **ZERO UNICODE EMOJIS, ZERO ARBITRARY ASSETS.**

---

## 1. REUSABLE VECTOR SVG ICON LIBRARY (WEB & MOBILE)

All icons use standard 24x24 viewBox, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.

### A. Deportes (Sports)
```tsx
// Pádel
export const IconPadel = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7" />
    <path d="M15 15l6 6" />
    <path d="M8 10h4" />
    <path d="M10 8v4" />
    <circle cx="18" cy="6" r="2" />
  </svg>
);

// Fútbol
export const IconFutbol = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m6.7 15 2.8-2.2 3 1.2 1.8 3.5" />
    <path d="m17.3 15-2.8-2.2-3 1.2-1.8 3.5" />
    <path d="m12 6.5 2.5 3-1 3.5h-3l-1-3.5z" />
  </svg>
);

// Tenis
export const IconTenis = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M3.6 9a14.4 14.4 0 0 1 16.8 0" />
    <path d="M3.6 15a14.4 14.4 0 0 0 16.8 0" />
  </svg>
);
```

### B. Amenidades & Características del Club (Amenities)
```tsx
// Techada (Indoor)
export const IconIndoor = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Descubierta / Aire Libre (Outdoor)
export const IconOutdoor = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);

// Iluminación LED
export const IconLighting = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.92 1.6 3.9.7.7 1.13 1.56 1.3 2.5" />
  </svg>
);

// Grabación / Cámaras HD
export const IconCamera = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="0" ry="0" />
  </svg>
);

// Estacionamiento
export const IconParking = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </svg>
);

// Buffet / Bar
export const IconBuffet = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

// Vestuarios / Duchas
export const IconLocker = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
  </svg>
);
```

### C. Acciones, Split & Transacciones
```tsx
// Split Players / Dividir Pago
export const IconSplit = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Escudo / Garantizado
export const IconShieldCheck = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

// Candado Seguro
export const IconLock = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// WhatsApp Direct
export const IconWhatsApp = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

// Flecha Arriba-Derecha (CTA Action)
export const IconArrowUpRight = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// Cerrar / Cruz Vectorial (Reemplazo obligatorio de ✕)
export const IconClose = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Check Vectorial (Reemplazo obligatorio de ✓)
export const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
```

---

## 2. CANCHA BLUEPRINTS (ESQUEMAS TÁCTICOS SVG)

Para vistas previas de canchas en modales o fichas de clubes:

### Esquema Cancha de Pádel (Proporción 1:2)
```tsx
export const CourtBlueprintPadel = ({ width = 120, height = 240, activeColor = '#fc1c46' }) => (
  <svg width={width} height={height} viewBox="0 0 100 200" fill="none" style={{ backgroundColor: '#070707', border: '1px solid rgba(255,255,255,0.1)' }}>
    {/* Paredes de Vidrio */}
    <rect x="5" y="5" width="90" height="190" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    {/* Red Central */}
    <line x1="5" y1="100" x2="95" y2="100" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" />
    {/* Líneas de Saque */}
    <line x1="5" y1="35" x2="95" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    <line x1="5" y1="165" x2="95" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    {/* Línea Central de Saque */}
    <line x1="50" y1="35" x2="50" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
  </svg>
);
```

---

## 3. FOTOGRAFÍA & TRATAMIENTO DE IMÁGENES

1. **Aspect Ratios Estándar:**
   - **Hero de Club:** `16:9` (Mobile: `4:3`).
   - **Tarjeta de Cancha:** `16:10`.
   - **Avatares de Jugadores / Logos:** `1:1` estrictamente circular (`borderRadius: '50%'`).
2. **El Overlay Oscuro Obligatorio (Dark Gradient Scrim):**
   - Nunca renderizar texto sobre una imagen cruda.
   - Usar siempre el scrim de legibilidad WCAG AAA:
     ```css
     background: linear-gradient(
       to top,
       rgba(0, 0, 0, 0.95) 0%,
       rgba(0, 0, 0, 0.5) 50%,
       rgba(0, 0, 0, 0.2) 100%
     );
     ```

---

## 4. STATUS BADGE SYSTEM (PILLS ESTANDARIZADAS)

Todos los badges DEBEN tener `borderRadius: 'var(--radius-full)'` (`9999px`), `fontSize: 10.5px` o `11px`, y `fontWeight: 700` / `800` uppercase con `letterSpacing: '0.6px'`:

| Estado | Fondo (Background) | Texto (Color) | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Confirmado** | `rgba(16, 185, 129, 0.12)` | `#10b981` (Emerald) | `CONFIRMADO` |
| **Pendiente / Split** | `rgba(245, 158, 11, 0.12)` | `#f59e0b` (Amber) | `ESPERANDO PAGOS` |
| **Turno Fijo Liberado** | `rgba(252, 28, 70, 0.15)` | `#fc1c46` (Crimson) | `LIBERADO HOY` |
| **Descuento / Promo** | `rgba(252, 28, 70, 0.2)` | `#fc1c46` (Crimson) | `-20% OFF` |
| **Pausada / Inactiva** | `rgba(255, 255, 255, 0.05)` | `#9ca3af` (Ash) | `PAUSADA` |
