import { EventDetailContent } from "@/components/event-detail-content";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  prefetch(
    trpc.event.getEventByIdandUser.queryOptions({
      eventId: eventId,
    }),
  );

  const inviteUrl = `${process.env.VERCEL_URL}`;

  return (
    <HydrateClient>
      <EventDetailContent eventId={eventId} url={inviteUrl} />
    </HydrateClient>
  );
}
