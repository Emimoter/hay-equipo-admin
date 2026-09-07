# HAY EQUIPO — DESIGN SYSTEM SPECIFICATION (SSOT)

> **SINGLE SOURCE OF TRUTH (SSOT)**  
> This specification governs all design, layout, geometry, color, and interaction decisions across the entire **Hay Equipo** ecosystem (Web: `apps/web-club`, Mobile: `apps/mobile`).
>
> Any newly created or modified component MUST strictly comply with this document.

---

## 1. DUAL GEOMETRY ARCHITECTURE

Hay Equipo implements a strict dual-geometry paradigm that visually separates **information structure** from **user action**:

| Element Category | Geometry Rule | Implementation (Web) | Implementation (Mobile) |
| :--- | :--- | :--- | :--- |
| **Structural Containers**<br>(Cards, Panels, Modals, Drawers, Sheets, Grid Cells, Input Boxes) | **STRICTLY 90° RECTANGLE**<br>(Sharp corners, zero curve) | `border-radius: 0px !important`<br>`className="rounded-none"` | `borderRadius: 0` |
| **Interactive Controls**<br>(Buttons, CTAs, Filter Chips, Date/Time Pills, Tabs, Badges) | **STRICTLY 100% PILL**<br>(Fully rounded capsule) | `border-radius: 9999px`<br>`var(--radius-full)` | `borderRadius: 9999` |

### Architectural Purpose
- **Cards at 90°** create an ultra-precise, athletic, Swiss-inspired grid layout with zero dead margin and maximum data density.
- **Buttons at 9999px (Pills)** immediately invite touch/clicks, stand out against the rectilinear grid, and make tactile targets unmistakable.

---

## 2. STRICT ZERO-EMOJI POLICY

- **ZERO EMOJIS IN ANY UI OR CODE.**
- No exceptions for warnings, dates, sports, statuses, or greetings.
- Always use vector SVGs (Web: inline `<svg>` with stroke/fill; Mobile: `react-native-svg` or Lucide icons).

---

## 3. COLOR TOKENS

```css
:root {
  /* Canvas & Foundations */
  --color-void: #000000;             /* Background canvas */
  --color-obsidian: #0a0a0a;         /* Card / Surface background */
  --color-surface-elevate: #141414;  /* Elevated sheets & headers */
  --color-graphite: #262626;         /* 1px border lines & dividers */

  /* Signal & Accents */
  --color-crimson-signal: #fc1c46;   /* Primary CTA, Sport pulse */
  --color-crimson-glow: rgba(252, 28, 70, 0.35);

  /* Typography & Foregrounds */
  --color-frost: #ffffff;            /* High-contrast headings, text */
  --color-ash: #94a3b8;              /* Secondary copy, captions */
  --color-muted: #64748b;            /* Disabled state, placeholders */

  /* Semantic Feedback */
  --color-emerald: #10b981;          /* Success, paid in full */
  --color-amber: #f59e0b;            /* Warning, quórum countdown */
}
```

---

## 4. TYPOGRAPHY SYSTEM

- **Headings, Badges, Prices, Numeric Stats:** `Space Grotesk`
  - Font weights: 600 (SemiBold), 700 (Bold).
  - Uppercase transforms for section labels, buttons, and status tags.
- **Body Text, Instructions, Input Content:** `Inter` (or clean sans-serif)
  - Font weights: 400 (Regular), 500 (Medium).
  - Line-height: 1.5.

---

## 5. STANDARD VECTOR SVG ICONS

Always use 24x24 viewBox with clean vector geometry:
- **Calendar:** `<rect x="3" y="4" width="18" height="18" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />`
- **Clock:** `<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />`
- **Lock:** `<rect x="3" y="11" width="18" height="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />`
- **Shield Check:** `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />`
- **Zap:** `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />`
- **Repeat (Turno Fijo):** `<polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />`
- **Check:** `<polyline points="20 6 9 17 4 12" />`
- **Dismiss (X):** `<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />`

---

## 6. AUDIT CHECKLIST FOR CODING AGENTS

When reviewing or generating UI:
1. Verify no container has rounded corners (must be `borderRadius: 0`).
2. Verify no button or chip has sharp corners (must be `borderRadius: 9999px`).
3. Verify no Unicode emojis are present.
4. Verify colors map to `--color-void`, `--color-obsidian`, `--color-crimson-signal`, and `--color-frost`.
