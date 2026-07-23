import { db } from "@db/db";
import migrations from "@db/migrations/migrations";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

/**
 * DB migration gate。成功するまで通常ルートを出さない。
 */
export function useAppBootstrap() {
  const { success, error } = useMigrations(db, migrations);

  return {
    isReady: success === true,
    error: error ?? null,
  };
}
