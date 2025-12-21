/*
  Warnings:

  - You are about to drop the column `gender` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyIncome` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "gender",
DROP COLUMN "monthlyIncome";
