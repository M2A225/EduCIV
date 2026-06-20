-- AlterTable: add missing updated_at column to school_groups
ALTER TABLE "school_groups" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
