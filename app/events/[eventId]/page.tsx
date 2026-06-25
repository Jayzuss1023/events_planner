import { EventDetailContent } from "@/components/event-detail-content";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const session = await getSession();
  if (!session.data?.user.id) throw new Error("no user");
  const ownerUserId = session.data.user.id;
  const row = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: ownerUserId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      invite: { select: { token: true } },
      rsvps: { select: { status: true } },
    },
  });

  return <EventDetailContent ownerUserId={ownerUserId} eventId={eventId} />;
}
