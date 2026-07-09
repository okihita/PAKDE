# Cooperative Quests

Quests that establish and mature the cooperative (koperasi) as a legal entity.
See [`README.md`](../quests/README.md) for schema, status legend, and the
level-up rule.

Level-up requires **all required quests** in a level to be `Done`.

---

## Level 1 — Foundation

The coop's legal footprint: registered identity, location, and administrative
paperwork in order.

### Q-L1-01 Input AHU
- **Level:** 1 (Foundation)
- **Required:** Yes
- **Description:** Record the coop's AHU (Administrasi Hukum Umum) — the
  Ministry of Law registration number that legally establishes the entity.
- **Acceptance criteria:**
  - AHU number is present and matches the registered legal entity.
  - Registration date is recorded.
- **Prerequisites:** None
- **Verification evidence:** AHU field populated and validated against the
  legal registration record.
- **XP:** 100
- **Status:** ⬜ Not Started

### Q-L1-02 Input correct address
- **Level:** 1 (Foundation)
- **Required:** Yes
- **Description:** Capture the coop's official, correct registered address
  (alamat kantor). Used for legal correspondence and wilayah integration.
- **Acceptance criteria:**
  - Full address entered with valid province / regency / district / village
    (wilayah) selection.
  - Address passes format and completeness checks.
- **Prerequisites:** None
- **Verification evidence:** Address record saved with resolved wilayah codes.
- **XP:** 100
- **Status:** ⬜ Not Started

### Q-L1-03 Register administrative documents
- **Level:** 1 (Foundation)
- **Required:** Yes
- **Description:** Attach and register the coop's core administrative documents
  (e.g. AD/ART, deed of establishment, legalization letter).
- **Acceptance criteria:**
  - All mandated foundational documents are uploaded.
  - Each document is linked to the coop record.
- **Prerequisites:** Q-L1-01
- **Verification evidence:** Document list shows each required item attached.
- **XP:** 100
- **Status:** ⬜ Not Started

### Q-L1-04 Documents in good form
- **Level:** 1 (Foundation)
- **Required:** No (optional)
- **Description:** Ensure registered documents are complete, legible, and
  correctly formatted — not just attached. A quality gate that earns bonus XP.
- **Acceptance criteria:**
  - Documents are readable, signed where required, and free of obvious errors.
  - No missing pages or placeholders.
- **Prerequisites:** Q-L1-03
- **Verification evidence:** Reviewer/self-check confirmation that docs meet
  quality standard.
- **XP:** 50
- **Status:** 🔒 Locked

---

## Level 2 — Membership

The coop populates its membership base and initial capital.

### Q-L2-01 Member registration & documentation
- **Level:** 2 (Membership)
- **Required:** Yes
- **Description:** Register coop members with their identifying documentation.
- **Acceptance criteria:**
  - At least the founding members are registered with full identity data.
  - Each member record is documented and linked to the coop.
- **Prerequisites:** Level 1 complete
- **Verification evidence:** Member list with documented identities.
- **XP:** 100
- **Status:** 🔒 Locked

### Q-L2-02 Joining dates captured
- **Level:** 2 (Membership)
- **Required:** Yes
- **Description:** Record each member's joining date (tanggal bergabung) to
  establish tenure and membership timeline.
- **Acceptance criteria:**
  - Every registered member has a joining date.
  - Dates are logically consistent (not before coop establishment).
- **Prerequisites:** Q-L2-01
- **Verification evidence:** Member records show non-empty joining dates.
- **XP:** 100
- **Status:** 🔒 Locked

### Q-L2-03 Principal saving recorded
- **Level:** 2 (Membership)
- **Required:** Yes
- **Description:** Record each member's principal saving (simpanan pokok) — the
  mandatory one-time capital contribution.
- **Acceptance criteria:**
  - Principal saving amount is set per member.
  - At least founding members have principal savings recorded.
- **Prerequisites:** Q-L2-01
- **Verification evidence:** Savings record shows simpanan pokok per member.
- **XP:** 100
- **Status:** 🔒 Locked

---

## Level 3 — Business Unit

The coop structures its operations and governance.

### Q-L3-01 Business unit registration
- **Level:** 3 (Business Unit)
- **Required:** Yes
- **Description:** Register the coop's business unit(s) (unit usaha) — the
  operational arms through which the coop runs its activities.
- **Acceptance criteria:**
  - At least one business unit is registered with name and type.
  - Business unit is linked to the coop.
- **Prerequisites:** Level 2 complete
- **Verification evidence:** Business unit list shows registered units.
- **XP:** 100
- **Status:** 🔒 Locked

### Q-L3-02 Pengurus defined
- **Level:** 3 (Business Unit)
- **Required:** Yes
- **Description:** Define the coop's pengurus — the board/management officials
  (e.g. ketua, sekretaris, bendahara) and their roles.
- **Acceptance criteria:**
  - Core pengurus roles are assigned to identified members.
  - Each role has a clear responsibility definition.
- **Prerequisites:** Q-L3-01
- **Verification evidence:** Pengurus structure shows roles filled by members.
- **XP:** 100
- **Status:** 🔒 Locked
