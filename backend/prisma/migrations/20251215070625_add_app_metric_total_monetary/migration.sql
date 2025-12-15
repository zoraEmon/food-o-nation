-- CreateTable
CREATE TABLE "AppMetric" (
    "id" TEXT NOT NULL DEFAULT 'app-metrics',
    "totalMonetary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppMetric_pkey" PRIMARY KEY ("id")
);
