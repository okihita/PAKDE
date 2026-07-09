# Quests

Gamified progression tracker for PAKDE. Two independent progression tracks:

- **Cooperative (coop)** — the legal entity / tenant. Quests track whether the
  coop itself is properly established and documented.
- **Player (user)** — the individual profile / member. A separate document
  (`user.md`) tracks personal progression.

Each quest follows the schema defined below. A level is **completed** when every
*required* quest in that level reaches `Done`; optional quests grant bonus XP but
do **not** gate progression.

## Terminology

| Term | Meaning |
| --- | --- |
| Coop | The cooperative (koperasi) — the org/tenant in the multi-tenant model. |
| Player / User | An individual profile; a member of one or more coops. |
| Level | A tier of maturity for a coop or player. |
| Required quest | Must be `Done` to advance to the next level. |
| Optional quest | Bonus; contributes XP but does not gate level-up. |

## Quest schema

Every quest entry contains:

| Field | Description |
| --- | --- |
| `id` | Stable identifier, e.g. `Q-L1-01`. |
| `title` | Short name. |
| `level` | Tier number. |
| `required` | `Yes` / `No`. |
| `description` | What the quest is about and why it matters. |
| `acceptance criteria` | Objective, checkable conditions for completion. |
| `prerequisites` | Other quest ids or conditions that must hold first. |
| `verification evidence` | What proves it is done (record, document, flag). |
| `xp` | Reward points. |
| `status` | One of the values in the legend below. |

## Status legend

| Icon | Status | Meaning |
| --- | --- | --- |
| 🔒 | Locked | Prerequisites not yet met. |
| ⬜ | Not Started | Available, not begun. |
| 🔄 | In Progress | Partially done. |
| ✅ | Done | Acceptance criteria met and verified. |

## Files

- [`coop.md`](./coop.md) — cooperative-level quests (3 levels).
- [`user.md`](./user.md) — player-level quests (skeleton; to be defined).

## Level-up rule

> A level advances when **all required quests** in that level are `Done`.
> Optional quests add XP but never block the next level.
