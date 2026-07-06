# Milestones & Future Development

Scratchpad for feature ideas, backlog items, and development direction. Not a spec — a living brainstorm.

---

## In Progress

- [x] Store Layout floorplan editor (Konva.js canvas, shelf bins, inventory assignment)
- [x] DevDocStripe and DevConsole removal (prod cleanup)

---

## Backlog

### Purchase Order Module

A dedicated purchase order (PO) workflow for cooperative procurement. Complements the existing Sales (POS) and Inventory modules.

**Scope:**
- Create POs linked to suppliers/vendors (reuse vendor data from Sales?)
- Line items with product, quantity, unit price, total
- PO status lifecycle: `draft` → `submitted` → `approved` → `received` → `closed`
- Approval workflow (single-step for hackathon; multi-tier later)
- Receive goods: auto-increment inventory stock quantities on PO receipt
- Link to accounting journal entries on receipt (debit inventory, credit accounts payable)
- Printable PO document export (PDF)

**Why:**
- Current Sales module handles checkout but not procurement
- Cooperatives regularly order fertilizer, seeds, equipment in bulk
- PO → Receipt → Inventory is a natural workflow gap
- Completes the procurement-to-sales cycle

**Open Questions:**
- Reuse vendor list from Sales or create dedicated supplier table?
- Approval: role-based (manager/treasurer) or simple toggle?
- Should PO link to Business Units for unit-specific procurement?

---

## Ideas

- Barcode/QR scanner integration for inventory (camera-based)
- Member loan repayment schedule with amortization table
- SMS/WhatsApp notification bridge for overdue loans
- Mobile companion app (read-only member dashboard)
- Multi-cooperative mode (manage several koperasi from one desktop)
- Dark pattern detection — flag rapid-fire actions that suggest tampering
- RAT (Annual Member Meeting) agenda builder with voting
- Weather/crop data integration for agricultural cooperative forecasting
