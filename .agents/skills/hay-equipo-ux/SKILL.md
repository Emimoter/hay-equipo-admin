---
name: hay-equipo-ux
description: The authoritative UX, interaction design, micro-copy, and user journey playbook for the Hay Equipo ecosystem (Web & Mobile). Governs booking funnels, split payment psychology, turno fijo cycles, feedback states, and conversational sport copy.
---

# HAY EQUIPO UX & INTERACTION LAWS

> **AUTHORITATIVE DIRECTIVE:**  
> This skill governs the user experience, interaction architecture, feedback mechanisms, and conversational tone of **Hay Equipo** across both Web (`apps/web-club`) and Mobile (`apps/mobile`).  
> Every flow must be fast, direct, frictionless, and optimized for sport communities.

---

## 1. CORE UX PHILOSOPHY

1. **The 30-Second Booking Law:** A player must be able to open the app, find a court, select a time slot, and confirm payment in under 30 seconds. Zero unnecessary steps, zero corporate friction.
2. **Sport-First Psychology:** Matches happen between friends and rival teams. The interface must always communicate camaraderie, urgency ("quedan 2 cupos"), and sport pride.
3. **No Dead Ends:** Every empty state, error screen, or canceled booking must offer an immediate, thumb-friendly next action.

---

## 2. THE 3 CARDINAL USER FLOWS

### A. Flow 1: Quick Booking & Checkout
```
[Explorar / Home] ──► [Filtro Deporte/Fecha] ──► [Slot Chip (Pill)] ──► [Checkout Sheet/Modal] ──► [Mercado Pago]
```
* **Step 1: Discovery:**
  - Sport chips (Pádel / Fútbol / Tenis) are permanently sticky or top-of-mind pills.
  - Date pills highlight "Hoy", "Mañana", "Fin de Semana" as primary quick-picks.
* **Step 2: Slot Selection:**
  - Available slots are displayed as high-contrast pills (`#141414` background, hover/active Crimson Signal `#fc1c46`).
  - Unavailable slots are muted (`opacity: 0.35`, `cursor: not-allowed`).
* **Step 3: Checkout Drawer / Modal:**
  - Single summary view: Court name, date, time, total price.
  - Choice between **Pago Total (100%)** and **Dividir Pago (Split)**.
  - Buyer info auto-filled if logged in; 1-click Google or phone auth if guest.
  - CTA button: Full width, uppercase, locked at bottom on mobile: `PAGAR CON MERCADO PAGO →`.

---

### B. Flow 2: Split Payment & Match Lobby (Dividir Pago)
```
[Reserva Split Creada] ──► [Lobby Compartido] ──► [WhatsApp Link] ──► [Amigos Pagan Cupo] ──► [Partido Confirmado]
```
* **The Split Mechanism:**
  - 1 player reserves by paying their share (e.g. 1/4 in pádel, 1/10 in fútbol 5).
  - A unique token link is generated: `/split/[token]`.
* **WhatsApp Share Trigger:**
  - A dedicated green `#25D366` pill button automatically composes a friendly, complete WhatsApp message:
    `"¡Muchachos! Armé el partido en [Club] para el [Fecha] a las [Hora]hs. Entren acá para pagar su parte con Mercado Pago: [URL]"`
* **Live Roster Progress:**
  - Visual cupo counter: e.g. `2 de 4 pagaron`.
  - Paid players get green check pill badge; pending slots display Crimson outline pill badge.
  - Real-time refresh so players see slots fill instantly.

---

### C. Flow 3: Turno Fijo (Weekly Release & Claim)
```
[Abonado Fijo No Puede Jugar] ──► [Liberar Esta Semana] ──► [Cancha Sale a la Venta] ──► [Nuevo Jugador Reserva]
```
* **Turno Fijo Holder:**
  - Has a dedicated tab: **Turnos Fijos**.
  - Can liberate any upcoming week with 1 click: `Liberar fecha [DD/MM]`.
  - Modal confirms: *"Tu turno quedará disponible para la comunidad esta semana. Si alguien lo reserva, se acredita a tu favor."*
* **Community Buyer:**
  - Sees the liberated slot flagged with an animated Crimson pulse badge: `TURNO FIJO LIBERADO`.
  - Can book it instantly at standard club rate.

---

## 3. MICRO-COPY & CONVERSATIONAL TONE (ARGENTINE SPORT CONTEXT)

Hay Equipo speaks like a real player and club administrator in Argentina. Direct, energetic, passionate, respectful, and zero corporate fluff.

### Tone Guidelines:
| Context | ❌ DON'T USE (Corporate / Robot) | ✅ USE (Hay Equipo Tone) |
| :--- | :--- | :--- |
| **Reserva Confirmada** | *Su transacción ha sido procesada con éxito.* | *¡Turno confirmado! Ya estás en la cancha.* |
| **Split WhatsApp** | *Haga click aquí para liquidar su cuota pendiente.* | *¡Muchachos! Quedan cupos para el partido. Entren a pagar su parte:* |
| **Error en Pago** | *Ocurrió un error inesperado en la pasarela de pagos.* | *No pudimos procesar el cobro. Verificá tu saldo en Mercado Pago y reintentá.* |
| **Cancha Llena** | *No existen horarios disponibles para el criterio seleccionado.* | *No quedan canchas libres para esta fecha. Probá otro día o activá aviso.* |
| **Turno Fijo** | *La periodicidad ha sido asignada al cliente.* | *Turno Fijo asegurado todos los [Día] a las [Hora]hs.* |
| **Login CTA** | *Autentíquese para continuar con el servicio.* | *Iniciá sesión para asegurar tu lugar en el partido.* |

---

## 4. FEEDBACK & INTERACTION PATTERNS

### A. Modals vs Bottom Sheets vs Toasts
1. **Modals (Strictly 90° Rectangles):**
   - Used for **high-stakes, irreversible actions** (canceling a booking, confirming a 6-month contract, deleting a court).
   - Desktop and tablet standard.
2. **Bottom Sheets / Drawers (Mobile Native):**
   - Used for checkout and filter sheets on mobile devices (< 768px).
   - Swipe down to dismiss, sticky action pill at the bottom.
3. **Toasts & Notifications:**
   - Used for non-blocking feedback (e.g., *"Link de split copiado al portapapeles"*).
   - Auto-dismisses in 2.5 seconds. Black Obsidian `#0a0a0a` background with Crimson left border.

### B. Button States & Optimistic UI
* **Idle:** Bold uppercase, high contrast, active hover scale (`scale(1.01)`).
* **Loading:** Never leave a button freeze. Always swap text to active progress (`"Procesando cupo..."`, `"Sincronizando..."`, `"Verificando..."`), set `opacity: 0.7`, and `cursor: wait`.
* **Disabled:** `opacity: 0.4`, `cursor: not-allowed`.

### C. Empty States (No Match Found / No Bookings)
Never show a blank white or empty black void. Every empty state MUST include:
1. Custom SVG icon (no Unicode emojis).
2. Uppercase eyebrow label (`01 / SIN ACTIVIDAD`).
3. Direct title (`No tenés partidos próximos`).
4. Reassuring subtitle (*"Explorá las canchas de tu zona y armá el próximo encuentro con amigos"*).
5. Primary CTA pill button (*"BUSCAR CANCHAS DISPONIBLES →"*).

---

## 5. MOBILE ERGONOMICS (THE THUMB ZONE LAW)

1. **Floating Mobile Dock:**
   - Navigation tabs on mobile (`ReservarNavTabs`) must float centered above the screen bottom (`bottom: 18px`), encapsulated in a `9999px` pill dock.
2. **Sticky Primary CTAs:**
   - In checkout sheets and booking flows, the confirmation CTA must stick to the bottom of the viewport so the user doesn't have to scroll down after reviewing the summary.
3. **Touch Target Size:**
   - Minimum height for all interactive pill buttons: `44px` (ideal: `48px` to `52px`).
   - Generous tap targets for date pills and time slots to prevent mis-clicks with sweaty thumbs.
