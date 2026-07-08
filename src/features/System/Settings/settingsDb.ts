import { getDb } from "@/db";
import type { CooperativeProfile } from "@/types";

export async function updateCooperative(id: string, data: Partial<CooperativeProfile>): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE cooperatives SET name=?, legal_id=?, address=?, village=?, district=?, regency=?, province=?, postal_code=?, phone=?, email=?, business_units=?, officers=?, updated_at=datetime('now') WHERE id=?`,
    [
      data.name || null,
      data.legal_id || null,
      data.address || null,
      data.village || null,
      data.district || null,
      data.regency || null,
      data.province || null,
      data.postal_code || null,
      data.phone || null,
      data.email || null,
      data.business_units || null,
      data.officers || null,
      id,
    ],
  );
}

export async function deleteCooperative(id: string): Promise<void> {
  const db = await getDb();
  // Delete in dependency order (children before parents)
  await db.execute(
    "DELETE FROM sales_transaction_items WHERE transaction_id IN (SELECT id FROM sales_transactions WHERE cooperative_id = ?)",
    [id],
  );
  await db.execute("DELETE FROM sales_transactions WHERE cooperative_id = ?", [id]);
  await db.execute(
    "DELETE FROM journal_lines WHERE journal_entry_id IN (SELECT id FROM journal_entries WHERE cooperative_id = ?)",
    [id],
  );
  await db.execute("DELETE FROM journal_entries WHERE cooperative_id = ?", [id]);
  await db.execute(
    "DELETE FROM sensitivity_analyses WHERE financial_analysis_id IN (SELECT id FROM financial_analyses WHERE cooperative_id = ?)",
    [id],
  );
  await db.execute("DELETE FROM financial_analyses WHERE cooperative_id = ?", [id]);
  await db.execute(
    "DELETE FROM layout_zones WHERE layout_id IN (SELECT id FROM store_layouts WHERE cooperative_id = ?)",
    [id],
  );
  await db.execute("DELETE FROM store_layouts WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM inventory_items WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM categories WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM members WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM local_users WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM ews_alerts WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM ews_metrics WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM sync_history WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM coa_accounts WHERE cooperative_id = ?", [id]);
  await db.execute("DELETE FROM cooperatives WHERE id = ?", [id]);
}
