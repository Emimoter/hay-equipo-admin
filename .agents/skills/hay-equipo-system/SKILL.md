---
name: hay-equipo-system
description: The single source of truth for Hay Equipo UI/UX architecture, visual tokens, dual-geometry rules, SVG iconography, and zero-emoji compliance. MANDATORY for all web and mobile interface work across the ecosystem.
---

# HAY EQUIPO DESIGN SYSTEM & UI LAWS

> **AUTHORITATIVE DIRECTIVE:**  
> This document defines the non-negotiable visual DNA of **Hay Equipo** across both Web (`apps/web-club`) and Mobile (`apps/mobile`).  
> Every screen, modal, component, drawer, and interface element MUST adhere to these exact geometry rules, color tokens, typography, and icon standards.  
> **DO NOT INVENT NEW STYLES, DO NOT MIX GEOMETRIES, AND NEVER USE EMOJIS.**

---

## 1. THE DUAL GEOMETRY LAW (CARDINAL ARCHITECTURE)

The visual tension and identity of Hay Equipo relies on a strict distinction between **Passive Structural Containers** and **Active Interactive Triggers**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STRUCTURAL CONTAINERS  ──────► STRICTLY 90° RECTANGLES   │
│    (Cards, Panels, Modals,         (border-radius: 0px)     │
│     Sheets, Grids, Surfaces)                                │
│                                                             │
│    ┌───────────────────────────────────────────────────┐    │
│    │ 2. INTERACTIVE CONTROLS ──► STRICTLY 100% PILLS   │    │
│    │    (Buttons, CTAs, Chips,    (border-radius:      │    │
│    │     Tabs, Badges, Toggles)    9999px)             │    │
│    └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### A. Containers & Structural Surfaces → STRICTLY 90° SHARP
* **Rule:** `border-radius: 0px !important` (React Native: `borderRadius: 0`).
* **Applies to:**
  - Content Cards (Court cards, Club cards, Match cards, Reservation summary cards)
  - Modals & Dialog windows
  - Drawers, Bottom Sheets, and Sidebars
  - Bento grid cells and data containers
  - Form input text boxes, select dropdowns, and search inputs
  - Table containers and stat panels
* **Rationale:** Creates architectural stability, Swiss precision, and maximum information density without wasted rounded corners.

### B. Interactive Controls & Action Triggers → STRICTLY 100% CAPSULE / PILL
* **Rule:** `border-radius: 9999px` (CSS: `var(--radius-full)` or `rounded-full`; React Native: `borderRadius: 9999`).
* **Applies to:**
  - All Primary CTA buttons (`#fc1c46` Crimson Signal)
  - Secondary Outline buttons & Ghost action buttons
  - Filter Chips (Sport selector: Pádel / Fútbol / Tenis)
  - Date & Time slot selection chips
  - Navigation tab switchers (e.g. Explorar / Mis Reservas / Turnos Fijos)
  - Status badges & discount pills (`-15% OFF`, `CONFIRMADO`, `LIBERADO`)
  - Icon action buttons (Close, Back, Share, Copy Link)
* **Rationale:** Clearly signals high-tactility, thumb-friendly affordance that immediately separates actionable triggers from informational containers.

---

## 2. STRICT ZERO-EMOJI LAW

* **BANNED:** Never use Unicode emojis in any user-facing code or interface:
  - ❌ No `⚽`, `🎾`, `🏀`, `🔒`, `⚡`, `📅`, `🗓️`, `🏆`, `💳`, `💸`, `👋`, `🎉`, `⚠️`, `✅`, `✓`, `✕`
* **MANDATORY:** Replace all iconography with custom vector SVGs or crisp SVG strokes (stroke-width: 1.5px or 2px, clean geometry).
* **Cross-Platform Implementation:**
  - **Web:** Clean inline `<svg>` elements with `width`, `height`, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`.
  - **Mobile:** `react-native-svg` (`Svg`, `Path`, `Circle`, `Rect`) or Lucide vector icons.

---

## 3. COLOR SYSTEM & SEMANTIC TOKENS

| Token Name | Hex Code | Semantic Role & Usage |
| :--- | :--- | :--- |
| **Void** | `#000000` | Deep root background, body canvas |
| **Obsidian** | `#0a0a0a` | Primary card & structural surface background |
| **Surface Elevate** | `#141414` / `#171717` | Elevated containers, headers, floating bars |
| **Crimson Signal** | `#fc1c46` | Brand pulse, primary CTAs, active highlights, key notifications |
| **Frost** | `#ffffff` | Primary text, active icons, high-contrast labels |
| **Ash** | `#94a3b8` / `#888888` | Secondary body text, timestamps, subtitles |
| **Graphite / Border** | `rgba(255, 255, 255, 0.1)` / `#262626` | 1px structural container borders, divider lines |
| **Emerald** | `#10b981` | Success states, confirmed bookings, paid in full |
| **Amber** | `#f59e0b` | Pending payments, expiring holds, countdowns |

---

## 4. TYPOGRAPHY HIERARCHY

* **Primary Display & Headings:** `Space Grotesk`
  - Uppercase tags, section eyebrows, hero headlines, prices, numbers, and stats.
  - Weights: `600` (SemiBold), `700` (Bold).
  - Letter-spacing: `-0.5px` on giant headings, `+0.5px` to `+1px` on small uppercase badges.
* **Body & Interface Copy:** `Inter` (or system UI sans)
  - Descriptions, terms, legal copy, input values, player rosters.
  - Weights: `400` (Regular), `500` (Medium).
  - Line-height: `1.45` to `1.6`.

---

## 5. REUSABLE SVG ICON LIBRARY (COPY-PASTE READY)

All icons use `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`:

### Calendar
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
</svg>
```

### Clock
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10" />
  <polyline points="12 6 12 12 16 14" />
</svg>
```

### Lock (Security / Auth)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <rect x="3" y="11" width="18" height="11" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>
```

### Shield Check (Guarantee)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <path d="M9 12l2 2 4-4" />
</svg>
```

### Zap (Instant Booking / Flash / Quórum)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
</svg>
```

### Repeat (Turno Fijo / Recurring)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="17 1 21 5 17 9" />
  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
  <polyline points="7 23 3 19 7 15" />
  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
</svg>
```

### Pádel (Racket)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="9" r="6" />
  <line x1="12" y1="15" x2="12" y2="22" />
  <circle cx="10.5" cy="8" r="0.75" fill="currentColor" />
  <circle cx="13.5" cy="8" r="0.75" fill="currentColor" />
  <circle cx="12" cy="10.5" r="0.75" fill="currentColor" />
</svg>
```

### Fútbol (Ball)
```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10" />
  <polygon points="12 7 15 10 14 14 10 14 9 10" />
  <line x1="12" y1="2" x2="12" y2="7" />
  <line x1="21.5" y1="8.5" x2="15" y2="10" />
  <line x1="18" y1="19.5" x2="14" y2="14" />
  <line x1="6" y1="19.5" x2="10" y2="14" />
  <line x1="2.5" y1="8.5" x2="9" y2="10" />
</svg>
```

### Check (Verified / Selected)
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="20 6 9 17 4 12" />
</svg>
```

### Close / Dismiss
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>
```

---

## 6. CODE RECIPES FOR WEB & MOBILE

### Web Component Example
```tsx
// STRUCTURAL CARD: 90°
<div style={{
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 0, // STRICTLY 90°
  padding: '24px',
}}>
  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#ffffff' }}>
    CANCHA 1 · PÁDEL PANORÁMICO
  </h3>
  
  {/* INTERACTIVE BUTTON: 100% PILL */}
  <button
    type="button"
    style={{
      backgroundColor: '#fc1c46',
      color: '#ffffff',
      border: 'none',
      borderRadius: '9999px', // STRICTLY PILL
      padding: '12px 24px',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    }}
  >
    RESERVAR TURNO
  </button>
</div>
```

### Mobile Component Example (React Native)
```tsx
// STRUCTURAL CONTAINER: 90°
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 0, // STRICTLY 90°
    padding: 20,
    marginBottom: 16,
  },
  
  // INTERACTIVE BUTTON: 100% PILL
  primaryButton: {
    backgroundColor: '#fc1c46',
    borderRadius: 9999, // STRICTLY PILL
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
```

---

## 7. PRE-FLIGHT VERIFICATION CHECKLIST

Before committing or deploying ANY UI changes:
- [ ] Are all cards, modals, sheets, and bento panels strictly 90° (`borderRadius: 0`)?
- [ ] Are all buttons, chips, tabs, and action triggers strictly pill (`borderRadius: 9999px`)?
- [ ] Are there ZERO Unicode emojis in the entire modified file?
- [ ] Are all icons sourced from clean vector SVGs?
- [ ] Is `Space Grotesk` used for headings/numbers and `Inter` for body?
- [ ] Does the color scheme strictly use `#000000`, `#0a0a0a`, `#fc1c46`, and `#ffffff`?
