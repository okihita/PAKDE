# Event Templates — Design Review

Templated cooperative events with auto-calculated cost predictions, engagement estimates,
preparation timelines, and strategic importance ratings. Displayed as a template picker
that pre-fills the event creation form.

---

## Concept Score: 8.5 / 10

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Utility for coop managers** | 9/10 | Managers know *what* events they should run (RAT, training) but not *how to budget or plan them*. Templates bridge that gap. |
| **Adoption reduction** | 8/10 | Choosing from templates is faster than filling fields from scratch. Reduces the "blank page" anxiety that kills event creation. |
| **Hackathon wow factor** | 7/10 | Good — shows the app *understands* cooperative operations. Not as flashy as the floorplan canvas, but demonstrates domain expertise. |
| **Implementation complexity** | Medium | Templates are static data. Predictions are simple arithmetic formulas. No AI needed. |
| **Data authenticity** | 9/10 | Real cooperatives have real event types with real costs. This feature grounds the app in reality vs. generic calendar apps. |

---

## Event Templates Catalog

Seven template types covering the full cooperative calendar:

```
┌──────────────────────────────────────────────────────────────────┐
│                     EVENT TEMPLATES                              │
│                                                                  │
│  ┌────────────────────────────┐  ┌───────────────────────────┐   │
│  │  🏛️  RAT (Annual Meeting)    │  │  🎓  Member Training        │   │
│  │  ⭐⭐⭐⭐⭐  Critical            │  │  ⭐⭐⭐⭐   High                │   │
│  │  💰 Rp 8-15M                │  │  💰 Rp 2-5M                │   │
│  │  👥 150-300 people           │  │  👥 30-80 people            │   │
│  │  📅 30 days prep             │  │  📅 14 days prep            │   │
│  │  🔖 Mandatory by law         │  │  🔖 SKKNI compliance        │   │
│  └────────────────────────────┘  └───────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────┐  ┌───────────────────────────┐   │
│  │  🤝  Community Gathering     │  │  🛒  Market Day / Bazaar     │   │
│  │  ⭐⭐⭐     Medium             │  │  ⭐⭐⭐     Medium             │   │
│  │  💰 Rp 0.5-2M               │  │  💰 Rp 1-3M                │   │
│  │  👥 50-200 people            │  │  👥 100-500 people          │   │
│  │  📅 7 days prep              │  │  📅 14 days prep            │   │
│  │  🔖 Member retention         │  │  🔖 Revenue opportunity     │   │
│  └────────────────────────────┘  └───────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────┐  ┌───────────────────────────┐   │
│  │  📊  Financial Report         │  │  🌱  Environment Day          │   │
│  │  ⭐⭐⭐⭐   High                │  │  ⭐⭐      Low-Medium          │   │
│  │  💰 Rp 0.5-1.5M             │  │  💰 Rp 0.2-1M               │   │
│  │  👥 30-80 people             │  │  👥 20-100 people           │   │
│  │  📅 7 days prep              │  │  📅 5 days prep             │   │
│  │  🔖 Transparency             │  │  🔖 Social impact           │   │
│  └────────────────────────────┘  └───────────────────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  ✨  Custom Event                                           │   │
│  │  ⭐        Variable                                         │   │
│  │  Start from scratch — full control over all fields          │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Template Detail Breakdown

Each template computes four predictions on selection:

```
                    Cost Prediction Model
    ┌──────────────────────────────────────────────┐
    │                                              │
    │   baseCost                                    │
    │     + (attendeeCount × costPerPerson)         │
    │     + (venueCost × daysNeeded)                │
    │     + fixedCosts (materials, permits, etc.)   │
    │     + contingency (15% buffer)                │
    │                                              │
    │   Engagement Estimate                         │
    │     Formula: baseAttendees × engagementFactor │
    │     (Factor based on event type & history)    │
    │                                              │
    │   Prep Timeline                               │
    │     Static per template + scaling factor for  │
    │     attendee count (>100 adds 5 extra days)   │
    └──────────────────────────────────────────────┘
```

### Template #1: RAT (Annual Member Meeting)

| Field | Value |
|-------|-------|
| **Legal requirement** | UU No. 25 Tahun 1992, mandatory |
| **Base cost** | Rp 8,000,000 |
| **Cost per attendee** | Rp 35,000 (meal + document printing) |
| **Venue cost/day** | Rp 1,500,000 |
| **Fixed costs** | Rp 2,000,000 (permits, banners, speaker honorarium) |
| **Default attendees** | 200 |
| **Engagement factor** | 0.85 (high — members attend for SHU report) |
| **Prep days** | 30 |
| **Importance** | ★★★★★ Critical |
| **SHU distribution?** | Yes — auto-link to accounting module |

**Prediction example (200 attendees):**
- Cost: 8M + (200 × 35K) + (1.5M × 1) + 2M + 15% = Rp 21,850,000
- Engagement: 200 × 0.85 = 170 attendees expected
- Prep: 30 days

### Template #2: Member Training / Workshop

| Field | Value |
|-------|-------|
| **Base cost** | Rp 2,000,000 |
| **Cost per attendee** | Rp 25,000 (materials, snacks) |
| **Venue cost/day** | Rp 500,000 |
| **Fixed costs** | Rp 1,000,000 (trainer fee, certificate printing) |
| **Default attendees** | 50 |
| **Engagement factor** | 0.7 |
| **Prep days** | 14 |
| **Importance** | ★★★★ High |
| **Skill tags** | Selectable: accounting, farming, digital literacy, cooperative law |

### Template #3: Community Gathering

| Field | Value |
|-------|-------|
| **Base cost** | Rp 500,000 |
| **Cost per attendee** | Rp 15,000 |
| **Venue cost/day** | Rp 200,000 |
| **Fixed costs** | Rp 500,000 (entertainment, decorations) |
| **Default attendees** | 80 |
| **Engagement factor** | 0.6 |
| **Prep days** | 7 |
| **Importance** | ★★★ Medium |
| **Purpose** | Member retention, community bonding |

### Template #4: Market Day / Bazaar

| Field | Value |
|-------|-------|
| **Base cost** | Rp 1,000,000 |
| **Cost per attendee** | Rp 5,000 (customer-facing — low cost) |
| **Venue cost/day** | Rp 500,000 |
| **Fixed costs** | Rp 1,500,000 (stalls, permits, promotion) |
| **Default attendees** | 300 |
| **Engagement factor** | 0.4 (public event, hard to predict) |
| **Prep days** | 14 |
| **Importance** | ★★★ Medium |
| **Revenue potential** | Direct — link to POS/inventory for stall sales |

### Template #5: Financial Report Presentation

| Field | Value |
|-------|-------|
| **Base cost** | Rp 500,000 |
| **Cost per attendee** | Rp 20,000 |
| **Venue cost/day** | Rp 300,000 |
| **Fixed costs** | Rp 500,000 (printed reports) |
| **Default attendees** | 40 |
| **Engagement factor** | 0.5 |
| **Prep days** | 7 |
| **Importance** | ★★★★ High |
| **Auto-attach** | Pull latest balance sheet / income statement as PDF |

### Template #6: Environment / Social Day

| Field | Value |
|-------|-------|
| **Base cost** | Rp 200,000 |
| **Cost per attendee** | Rp 10,000 |
| **Venue cost/day** | Rp 0 (outdoor, public space) |
| **Fixed costs** | Rp 500,000 (saplings, tools, snacks) |
| **Default attendees** | 50 |
| **Engagement factor** | 0.55 |
| **Prep days** | 5 |
| **Importance** | ★★ Low-Medium |
| **Impact tracking** | Link to Social Impact module — logs volunteer hours |

### Template #7: Custom

| Field | Value |
|-------|-------|
| **Everything** | Manual entry |
| **Use when** | None of the templates fit |

---

## Full Creation Flow (ASCII UI)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  < CalendarDays  EVENTS                                           [?]    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐      │
│  │  🏛️  RAT (Annual Meeting)    │  │  🎓  Member Training            │      │
│  │  ★★★★★  Critical            │  │  ★★★★   High                  │      │
│  │  📅  30 days prep            │  │  📅  14 days prep              │      │
│  │  🔖  Mandatory by law        │  │  🔖  SKKNI compliance          │      │
│  │  Choose                    → │  │  Choose                      → │      │
│  └──────────────────────────────┘  └──────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐      │
│  │  🤝  Community Gathering      │  │  🛒  Market Day / Bazaar       │      │
│  │  ★★★     Medium             │  │  ★★★     Medium               │      │
│  │  📅  7 days prep             │  │  📅  14 days prep              │      │
│  │  Choose                    → │  │  Choose                      → │      │
│  └──────────────────────────────┘  └──────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐      │
│  │  📊  Financial Report         │  │  🌱  Environment Day            │      │
│  │  ★★★★   High                │  │  ★★      Low-Medium            │      │
│  │  📅  7 days prep             │  │  📅  5 days prep               │      │
│  │  Choose                    → │  │  Choose                      → │      │
│  └──────────────────────────────┘  └──────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  ✨  Custom Event  —  Start blank, full control                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                     ┌─── User taps "Choose" on RAT ───┐
                     ▼                                  │

┌──────────────────────────────────────────────────────────────────────────┐
│  < ArrowLeft  Back to templates                                         │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │  🏛️  RAT — Annual Member Meeting  │  ★★★★★  MANDATORY               ││
│  │  UU No. 25 Tahun 1992 — Wajib dilaksanakan setiap tahun              ││
│  ├──────────────────────────────────────────────────────────────────────┤│
│  │                                                                      ││
│  │  Event Name                                                        ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ Rapat Anggota Tahunan — Koperasi Desa Makmur 2026             │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                      ││
│  │  Date                    Time             Expected Attendees        ││
│  │  ┌────────────────┐  ┌──────────┐  ┌──────────────────────────┐    ││
│  │  │ 2026-03-15      │  │ 09:00    │  │ 200                      │    ││
│  │  └────────────────┘  └──────────┘  └──────────────────────────┘    ││
│  │                                                                      ││
│  │  Location                                                           ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ Balai Desa Makmur                                              │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                      ││
│  ├──────────────────────────────────────────────────────────────────────┤│
│  │  💰  COST PREDICTION                                       [?]      ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  Base cost:         Rp   8,000,000                            │   ││
│  │  │  Attendee cost:     Rp   7,000,000  (200 × Rp 35,000)         │   ││
│  │  │  Venue:             Rp   1,500,000  (1 day × Rp 1,500,000)    │   ││
│  │  │  Fixed costs:       Rp   2,000,000  (permit, banner, speaker) │   ││
│  │  │  ─────────────────────────────────────                        │   ││
│  │  │  Subtotal:          Rp  18,500,000                            │   ││
│  │  │  Contingency (15%): Rp   2,775,000                            │   ││
│  │  │  ─────────────────────────────────────                        │   ││
│  │  │  ESTIMATED TOTAL:   Rp  21,275,000                            │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                      ││
│  │  👥  ENGAGEMENT PREDICTION                                   [?]     ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  Expected: 170 / 200 members (85%)                            │   ││
│  │  │  Based on: RAT events historically draw 80-90% attendance     │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                      ││
│  │  📅  PREPARATION TIMELINE                                    [?]     ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  D-30:  Form steering committee                               │   ││
│  │  │  D-21:  Finalize SHU calculation (Accounting module)          │   ││
│  │  │  D-14:  Print invitations, book venue                         │   ││
│  │  │  D-7:   Confirm speakers, finalize agenda                     │   ││
│  │  │  D-3:   Prepare materials, print financial reports            │   ││
│  │  │  D-1:   Venue setup, catering confirmation                    │   ││
│  │  │  ─────────────────────────────────────────                    │   ││
│  │  │  ⚠️  30 days recommended — start by 2026-02-13                │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                      ││
│  ├──────────────────────────────────────────────────────────────────────┤│
│  │  🔗  LINKED MODULES                                           [?]    ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  ☑  Auto-generate SHU report from Accounting data            │   ││
│  │  │  ☐  Send SMS reminders to all members (14 days before)        │   ││
│  │  │  ☐  Create attendance sheet in Members module                │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  ├──────────────────────────────────────────────────────────────────────┤│
│  │                                                                      ││
│  │  [ Cancel ]              [ Create Event with Template ]              ││
│  │                                                                      ││
│  └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Cost predictions are wrong and managers blame the app** | Medium | Label as "estimates" clearly. Add a `[?]` tooltip: "Based on typical costs for similar events in your regency. Adjust as needed." |
| **Managers trust predictions blindly** | Low | Allow manual override of every computed field. The prediction is a starting point, not a locked value. |
| **Template list grows unmanageable** | Low | Seven templates is the sweet spot. Resist adding more — use "Custom" for edge cases. |
| **SHU link requires accounting data to exist** | Medium | Graceful fallback: "SHU data not yet available. Complete accounting journal entries first." |

---

## Recommendation

**Implement templates after the empty state and form are wired.** The current event page (empty state + manual form) is a solid foundation. Templates sit on top as a convenience layer:

1. ✅ Empty state + manual form → *committed*
2. ☐ Event list with edit capability
3. ☐ Template picker as an optional path into the form
4. ☐ Cost/engagement/prep predictions (computed, not AI)
5. ☐ Module links (auto-attach SHU report, attendance sheets)

**Implementation effort:** ~3-4 hours for all 5 steps, with templates and predictions being ~2 hours of that.

**Should we do it?** Yes. It's one of the few features that demonstrates PAKDE *understands cooperative operations* rather than just being a generic calendar app. The prediction panels in the form are a strong demo moment — they show the app thinking alongside the manager.
