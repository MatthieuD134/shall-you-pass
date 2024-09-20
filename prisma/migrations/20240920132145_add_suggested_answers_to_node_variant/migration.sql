/*
  Warnings:

  - Added the required column `suggestedAnswerOne` to the `NodeVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestedAnswerThree` to the `NodeVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestedAnswerTwo` to the `NodeVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NodeVariant" ADD COLUMN     "suggestedAnswerOne" TEXT NOT NULL,
ADD COLUMN     "suggestedAnswerThree" TEXT NOT NULL,
ADD COLUMN     "suggestedAnswerTwo" TEXT NOT NULL;
