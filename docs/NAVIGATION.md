# Navigation Architecture & UI Structure

This document outlines the standard navigation patterns for the StuFlux application, adhering strictly to the "Cyber-Fluid" design system established in `VISUAL_DNA.md`.

## Core Philosophy

- **Mobile-First:** Navigation must feel natural on mobile devices, utilizing a bottom tab bar that resembles a floating physical object.
- **Desktop Adaptation:** Desktop uses a fixed top navigation for branding and core actions, maximizing vertical space. Search has a dedicated section to emphasize discovery.
- **Aesthetic:** "Pill-in-grid" shapes, frosted translucency (`.chrome-card`), and fluid interactive states.

---

## Mobile Navigation Structure

The mobile navigation is a **floating, pill-shaped bottom tab bar** (using the `.chrome-card` styling with `backdrop-blur`). 

### The 5 Primary Tabs
1. 🔍 **Explore (Home)**
   - **Purpose:** Main feed and category discovery.
   - **Content:** Infinite-scroll grid of items.
2. 💬 **Inbox (Messages)**
   - **Purpose:** Peer-to-peer communication.
   - **Content:** Conversation list. Needs a prominent unread badge (accent color).
3. ➕ **Post Item (Center Action)**
   - **Purpose:** Supply generation.
   - **Styling:** A prominent, slightly elevated Floating Action Button (FAB) nested in the center, utilizing the `.liquid-button` animated gradient class to draw the eye.
4. 📅 **Activity (Bookings)**
   - **Purpose:** Tracking rental statuses.
   - **Content:** Two tabs: "Borrowing" and "Lending".
5. 👤 **Profile**
   - **Purpose:** Identity and trust.
   - **Content:** User reviews, trust score, account settings, storefront.

### Visual Integration
- **Container:** Margin from screen edges (`m-4`), heavily rounded (`rounded-full`), floating over content.
- **Active State:** Indicated by a subtle, glowing gradient dot below the icon, or iridescent icon fill.

---

## Desktop Navigation Structure

Desktop navigation is split into a **fixed, frosted Top Navigation Bar** for global actions, and a **Dedicated Search Section** just below it for discovery.

### 1. Top Navigation Bar
Acts as sleek "chrome hardware" spanning the top of the screen (`.chrome-card` spanning full width, fixed at top).

**Left Group: Brand**
- **Logo:** "StuFlux" text (brutalist **Syne** font). Clicking routes back to Explore.

**Right Group: Actions & Context**
- **Explore:** Text link (with `.glitch-text` hover effect).
- **Messages:** Icon with unread badge.
- **🔔 Notifications:** Bell icon with a distinct notification dot/badge for alerts (system updates, booking changes).
- **Activity:** Icon or text link for active bookings.
- **"Post Item" CTA:** A highly visible `.liquid-button` pill.
- **User Context:** Circular profile picture opening a frosted dropdown menu (Profile, Account Settings, Sign Out).

### 2. Dedicated Search Section (Below Navigation)
To keep the top bar clean and focus user attention on discovery, the search functionality lives in its own dedicated section directly below the navigation bar (often acting as the hero section of the Explore page).

- **Placement:** Centered horizontally, pushed slightly down from the top navigation.
- **Structure:** A wide, oversized pill-shaped input.
- **Features:** Includes text search and prominent category filters/dropdowns attached to the input.
- **Styling:** Thick inner borders, high contrast on hover/focus, utilizing `border-surface-border` and `bg-surface-elevated/40`.
