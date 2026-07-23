import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 最小 settings 枠。製品ドメイン列は置かない。
 * key / value の汎用 KV のみ。
 */
export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
