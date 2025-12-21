/*
  Warnings:

  - You are about to drop the `_SurveyQuestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SurveyQuestions" DROP CONSTRAINT "_SurveyQuestions_A_fkey";

-- DropForeignKey
ALTER TABLE "_SurveyQuestions" DROP CONSTRAINT "_SurveyQuestions_B_fkey";

-- DropTable
DROP TABLE "_SurveyQuestions";
