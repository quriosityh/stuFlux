# StuFlux Visual DNA: Cyber-Fluid

This document serves as the central source of truth for the StuFlux design system. It defines the core visual identity, color palettes, typography, and specific UI elements that must be consistently applied across the frontend.

## 1. Core Identity & Theme Cohesion

**Cyber-Fluid** is a high-contrast, liquid-metallic aesthetic bridging early 2000s tech nostalgia (Frutiger Aero, liquid metal, translucent plastics) with ultra-modern 2026 brutalist layouts. It treats the UI like a physical piece of glass/chrome hardware. 

To ensure StuFlux feels like a singular, premium product, both Light and Dark modes share this core DNA, but they react to their environments differently:

- **Materials:** Frosted translucent surfaces (`backdrop-blur`) combined with a subtle physical grain/noise texture to mimic high-end hardware.
- **Shapes ("Pill-in-Grid"):** A strict, brutalist grid layout ("Cyber") contrasting violently with perfectly rounded, pill-shaped interactive elements ("Fluid").
- **Animations ("Liquid Hover"):** Fluid, shifting CSS gradients on hover states that mimic flowing liquid metal or shifting light.

### 🌑 Dark Mode: "Deep Space Chrome"
*The vibe: A high-end hacker terminal or a sleek supercar dashboard at night.*
- **Environment:** The hardware sits in deep space black. 
- **Light Source:** The UI elements emit intense, highly saturated neon lights.
- **Vibe:** Aggressive, unapologetic, highly "cyber".

### ☀️ Light Mode: "Icy Daylight Chrome"
*The vibe: A sterile, futuristic laboratory or high-end frosted tech hardware.*
- **Environment:** The hardware sits in bright, pearlescent white.
- **Light Source:** The UI elements *diffract* environmental light, creating an oil-slick/holographic sheen.
- **Vibe:** Clean, premium, sterile but deeply interactive.

---

## 2. Color Palette & Tokens

### Light Mode (Icy Daylight Chrome)
- **Background:** Pure Pitch White (`#FFFFFF`) to match the extreme contrast pattern of Dark Mode.
- **Surfaces:** Translucent Cool Gray Glass (`rgba(240, 240, 245, 0.65)`) to stand out against the pure white background.
- **Text:** Stark Black (`#0A0A0A`) for maximum contrast.
- **Accents:** Liquid Cobalt & Cyan.
  - *Base Accent:* Deep Cobalt Blue (`#005BEA`) for legible standalone text.
  - *Gradient:* `linear-gradient(135deg, #005BEA 0%, #00C6FF 50%, #005BEA 100%)`

### Dark Mode (Deep Space Chrome)
- **Background:** Deep Space Black (`#050505`).
- **Surfaces:** Dark Chrome/Graphite (`rgba(28, 28, 30, 0.6)`).
- **Text:** Pure White (`#FFFFFF`) and Silver (`#A1A1AA`).
- **Accents:** Neon Cyan (`#00FFFF`) and Electric Blue (`#0066FF`) to maintain the unified cyber-fluid aura.

---

## 3. Typography

- **Headings (The "Cyber"):** **Syne** (Google Fonts). Wide, brutalist, and modern aesthetic. Used for `h1` through `h6` and `.font-display`.
- **Body (The "Fluid"):** **Manrope** (Google Fonts). Clean, geometric, and perfectly balances the aggressive headings.

---

## 4. UI Elements & "Wow" Factors

To make this design truly stand out, implement these specific CSS-driven "wow" elements utilizing our `globals.css` utility classes:

### 1. Liquid Chrome Surfaces (`.chrome-card`)
- **What it is:** The primary container for any structured content.
- **Implementation:** Uses `backdrop-blur`, an SVG noise texture overlay pseudo-element to simulate physical material, and a subtle 1px inner bevel (`box-shadow: inset 0 1px 0 ...`) to simulate light reflecting off a curved edge.
- **Rule:** Never use standard flat background cards. Always use the `.chrome-card` utility.

### 2. Liquid Buttons (`.liquid-button`)
- **What it is:** Primary CTAs and highly interactive elements.
- **Implementation:** Strict `rounded-full` (pill shape). Uses animated CSS gradients (`background-size: 200% 200%`) that shift on hover. 
  - *Dark Mode:* Acid Green shifting to Electric Lime.
  - *Light Mode:* Holographic Iridescent shift.
- **Rule:** Primary actions must use `.liquid-button`.

### 3. Chromatic Glitch Effects (`.glitch-text`)
- **What it is:** Subtle hover states on primary text or links.
- **Implementation:** Momentarily splits into RGB channels (a tiny red/blue `text-shadow`) on hover to emphasize the "cyber" aspect.
- **Rule:** Use sparingly on standalone links or large heading interactions.
