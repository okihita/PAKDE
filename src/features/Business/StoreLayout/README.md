# Store Layout & Floor Plan Editor

A 2D drag-and-drop shelf layout designer for cooperative retail stores (*Waserda*), backed by offline SQLite persistence and real-time inventory shelf assignment.

## Why This Feature Wins

Three things kill rural cooperative stores: **chaotic shelf organization**, **inventory disconnection from physical layout**, and **low manager buy-in** for digitization. This feature attacks all three simultaneously.

### 1. Physical-Digital Twin Done Right
Unlike generic spreadsheet-based inventory that exists purely in abstract tables, the Store Layout editor creates a **visual twin** of the actual cooperative shop floor. Each shelf bin on screen corresponds to a physical shelf in the store. Inventory items are assigned directly to shelf positions — making stock location immediately legible to any staff member, no training needed.

### 2. Offline-First, Zero Friction
The entire editor works offline. Layout changes, shelf placements, and inventory assignments persist to the local SQLite database without any network dependency. Cooperatives in areas with unstable internet (the exact target demographic) never experience loading spinners or sync failures.

### 3. Operator-Level Usability
The toolbar uses four tools — Select, Zone, Shelf, Erase — that mirror physical actions. Zone areas are drawn by click-drag. Shelf racks place with a single click. Inventory assignment is a dropdown picker inside the shelf panel. A cooperative store manager with basic smartphone literacy can design their floor plan in under 15 minutes.

## Gamification: The 15-Minute Quest Design

Every interaction in the Store Layout editor is designed as a **micro-quest** that completes in 15 minutes or less. This isn't just good UX — it's a deliberate gamification strategy that drives adoption.

### Why 15 Minutes?
Rural cooperative managers are time-poor. They run shops, attend RAT meetings, and manage members. A feature that demands hours of configuration will never be adopted. A feature that delivers visible progress in a single coffee break *will*.

### The Quest Flow

| Quest | Time | Action | Dopamine Hit |
|-------|------|--------|-------------|
| **Create Store** | 3 min | Name your layout, set room dimensions, pick grid cell size | Tactile soft-thud sound on creation |
| **Draw Zones** | 5 min | Click-drag to paint product category areas (produce, hardware, fertilizer) | Color-coded zones with satisfying snap-to-grid |
| **Place Shelves** | 4 min | Drop shelf racks into zones, adjust rows/columns per product type | Stock indicator colors (green/amber/red) appear instantly |
| **Assign Inventory** | 3 min | Link existing inventory items to specific shelf bins | Items visually populate shelf slots with stock counts |

Each completed quest advances the cooperative's **Aspect-Based Leveling** progress in the "Business Units" (*Unit Usaha*) track. The system automatically detects when shelves are fully populated and awards XP.

### Sound Design as Feedback Loop
Every tool action triggers a synthesized 8-bit sound effect via the Web Audio API:
- **Zone/Shelf placement** → warm triangle-wave thud (80-100Hz, feels like setting down a heavy object)
- **Erase** → sharp square-wave snap (confirms deletion without ambiguity)
- **Save** → ascending C-major arpeggio chime (reward signal)
- **Item assignment** → soft click (low cognitive load, fast repetition)

No external assets, no loading. All sounds are procedurally generated oscillator tones under 0.12 seconds — pure tactile feedback.

## Technical Foundation

- **Canvas**: Konva.js (react-konva) with GPU-accelerated rendering
- **Grid**: Configurable cell size (0.5m, 1m, 2m) with axis labels and grid-line snap
- **Drag**: Real-time zone dragging with boundary clamping, no React setState jank (RAF-throttled mouse tracking)
- **Persistence**: SQLite via Tauri Rust backend, schema-healed on first access
- **Zoom**: Mouse-wheel centered zoom (0.3x–2.5x) with fit-to-screen and step buttons

## Connection to Broader PAKDE Vision

The Store Layout editor is a concrete implementation of the **Federated Node Network** philosophy:
- Shelf layouts are stored locally (offline-first, data sovereignty)
- Anonymous layout efficiency metrics can sync upstream without exposing individual product sales data
- Regional dashboards can surface layout optimization suggestions across cooperatives with similar product mixes

This feature demonstrates that PAKDE isn't just an accounting tool — it's a **complete cooperative operations platform** that respects what rural koperasi actually need: practical, visual, fast, and rewarding to use.
