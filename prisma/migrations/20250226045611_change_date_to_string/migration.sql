-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL
);
INSERT INTO "new_Invoices" ("amount", "customer_id", "date", "id", "status") SELECT "amount", "customer_id", "date", "id", "status" FROM "Invoices";
DROP TABLE "Invoices";
ALTER TABLE "new_Invoices" RENAME TO "Invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
