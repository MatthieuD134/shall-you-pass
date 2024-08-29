/*
  Warnings:

  - You are about to drop the column `aiContentFeed` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `storySummary` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `aiContentFeed` on the `Story` table. All the data in the column will be lost.
  - Added the required column `storySummary` to the `NodeVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "aiContentFeed",
DROP COLUMN "storySummary";

-- AlterTable
ALTER TABLE "NodeVariant" ADD COLUMN     "storySummary" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "aiContentFeed";
