import { InviteRsvpContent } from "@/components/invite-rsvp-content";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  prefetch(
    trpc.event.getEventInvite.queryOptions({
      token,
    }),
  );
  return (
    <HydrateClient>
      <InviteRsvpContent token={token} submitted={query.submitted === "1"} />
    </HydrateClient>
  );
}
