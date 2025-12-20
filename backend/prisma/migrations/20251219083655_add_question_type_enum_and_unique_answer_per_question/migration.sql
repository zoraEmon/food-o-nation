/*
  Warnings:

  - A unique constraint covering the columns `[surveyId,questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('FOOD_FREQUENCY', 'FOOD_SECURITY_SEVERITY');


-- 1. Add the column as nullable first
ALTER TABLE "Question" ADD COLUMN "type" "QuestionType";

-- 2. Set a default value for all existing rows (choose FOOD_FREQUENCY as default, adjust if needed)
UPDATE "Question" SET "type" = 'FOOD_FREQUENCY' WHERE "type" IS NULL;

-- 3. Alter the column to be NOT NULL
ALTER TABLE "Question" ALTER COLUMN "type" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_surveyId_questionId_key" ON "Answer"("surveyId", "questionId");
