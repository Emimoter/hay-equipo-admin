# AGENTS.MD — PROJECT INSTRUCTIONS FOR HAY EQUIPO

## CRITICAL UI/UX DIRECTIVES (MANDATORY)

Every AI agent, developer, and automated process working in this repository MUST comply with the following rules:

1. **CONSULT THE DESIGN SYSTEM:**
   - Refer directly to `.agents/skills/hay-equipo-system/SKILL.md` and `DESIGN_SYSTEM.md`.
   - Never invent new UI themes, random border-radiuses, or arbitrary color schemes.

2. **THE DUAL GEOMETRY RULE:**
   - **Structural Containers:** (Cards, Modals, Drawers, Sheets, Bento Panels, Grid Blocks, Input Fields) must be **STRICTLY 90° RECTANGLES** (`border-radius: 0px` / `rounded-none`).
   - **Interactive Controls:** (Buttons, CTAs, Filter Chips, Date/Time Pills, Tabs, Badges, Toggles) must be **STRICTLY 100% PILLS** (`border-radius: 9999px` / `rounded-full`).

3. **ABSOLUTE ZERO-EMOJI POLICY:**
   - Never use Unicode emojis in UI text, labels, alerts, headers, or buttons.
   - Always use clean SVG vector icons (defined in `.agents/skills/hay-equipo-system/SKILL.md`).

4. **COLOR PALETTE:**
   - Canvas: `#000000` (Void)
   - Cards/Surfaces: `#0a0a0a` (Obsidian)
   - Accents/CTAs: `#fc1c46` (Crimson Signal)
   - Text: `#ffffff` (Frost) and `#94a3b8` (Ash)
   - Success: `#10b981` (Emerald)

5. **DEPLOYMENT PROTOCOL:**
   - Production deployments are triggered via terminal: `npx vercel deploy --prod --yes` from the project root.
   - Always verify that `npm run build` succeeds with 0 errors before deploying.
