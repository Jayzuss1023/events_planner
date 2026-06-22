-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('going', 'maybe', 'not_going');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "event_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invites" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_rsvps" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "invite_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL,
    "responded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_events_owner" ON "events"("owner_user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "event_invites_event_id_key" ON "event_invites"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_invites_token_key" ON "event_invites"("token");

-- CreateIndex
CREATE INDEX "idx_rsvps_event" ON "event_rsvps"("event_id", "responded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_event_id_emailNormalized_key" ON "event_rsvps"("event_id", "emailNormalized");

-- AddForeignKey
ALTER TABLE "event_invites" ADD CONSTRAINT "event_invites_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "event_invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
