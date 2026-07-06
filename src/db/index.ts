import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:kdkmp.db");
    await dbInstance.execute("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}
