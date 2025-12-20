/*
  Warnings:

  - You are about to drop the column `activeEmail` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q1` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q2` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q3` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q4` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q5` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - You are about to drop the column `q6` on the `FoodSecuritySurvey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[beneficiaryId,createdAt]` on the table `FoodSecuritySurvey` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FoodSecuritySurvey_beneficiaryId_periodStart_idx";

-- DropIndex
DROP INDEX "FoodSecuritySurvey_beneficiaryId_periodStart_periodEnd_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Beneficiary" DROP COLUMN "activeEmail",
ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FoodSecuritySurvey" DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
DROP COLUMN "q1",
DROP COLUMN "q2",
DROP COLUMN "q3",
DROP COLUMN "q4",
DROP COLUMN "q5",
DROP COLUMN "q6";

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "foodSeverityResponse" "FoodSecuritySeverity",
    "foodFrequencyResponse" "FoodFrequency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageLogo" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageAbout" (
    "id" TEXT NOT NULL,
    "aboutUs" VARCHAR(3000) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageAbout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSocialMedia" (
    "id" TEXT NOT NULL,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "linkedinUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContact" (
    "id" TEXT NOT NULL,
    "contactNumber" TEXT,
    "contactEmail" TEXT,
    "location" TEXT,
    "serviceSchedule" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SurveyQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SurveyQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SurveyQuestions_B_index" ON "_SurveyQuestions"("B");

-- CreateIndex
CREATE INDEX "FoodSecuritySurvey_beneficiaryId_createdAt_idx" ON "FoodSecuritySurvey"("beneficiaryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FoodSecuritySurvey_beneficiaryId_createdAt_key" ON "FoodSecuritySurvey"("beneficiaryId", "createdAt");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "FoodSecuritySurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyQuestions" ADD CONSTRAINT "_SurveyQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "FoodSecuritySurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyQuestions" ADD CONSTRAINT "_SurveyQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
