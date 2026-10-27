-- CreateTable
CREATE TABLE "dispatch_sessions" (
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "currentRadius" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "stageStartedAt" TIMESTAMP(3) NOT NULL,
    "stageEndsAt" TIMESTAMP(3) NOT NULL,
    "hardTimeoutAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "orderData" JSONB NOT NULL,
    "customerLat" DOUBLE PRECISION NOT NULL,
    "customerLng" DOUBLE PRECISION NOT NULL,
    "tailorPool" JSONB NOT NULL,
    "totalEligibleCount" INTEGER NOT NULL DEFAULT 0,
    "declinedTailorIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeCandidateTailorIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "acceptedTailorId" TEXT,
    "acceptedTailor" JSONB,
    "confirmedOrder" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatch_sessions_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE INDEX "dispatch_sessions_status_stageEndsAt_idx" ON "dispatch_sessions"("status", "stageEndsAt");

-- CreateIndex
CREATE INDEX "dispatch_sessions_expiresAt_idx" ON "dispatch_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "dispatch_sessions_activeCandidateTailorIds_idx" ON "dispatch_sessions" USING GIN ("activeCandidateTailorIds");
