import { prisma } from "@/lib/prisma";
import { router, publicProcedure, authProcedure } from "../init";
import { z } from "zod";
import { getSession } from "@/lib/auth/server";
import type { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/enums";
import { notFound, redirect } from "next/navigation";

export function countByStatus(rsvps: { status: PrismaRsvpStatus }[]) {
  let goingCount = 0;
  let maybeCount = 0;
  let notGoingCount = 0;

  for (const r of rsvps) {
    if (r.status === "going") goingCount += 1;
    else if (r.status === "maybe") maybeCount += 1;
    else if (r.status === "not_going") notGoingCount += 1;
  }

  return { goingCount, maybeCount, notGoingCount };
}

export const eventsRouter = router({
  getUserEvents: authProcedure
    .input(z.object({ id: z.string() }).optional())
    .query(async () => {
      const session = await getSession();
      if (!session.data?.user.id)
        throw new Error("Unable to retrieve your events");
      const userId = session.data.user.id;
      const rows = await prisma.event.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          eventDate: true,
          location: true,
          rsvps: { select: { status: true } },
        },
      });

      const events = rows.map((e) => ({
        id: e.id,
        title: e.title,
        eventDate: e.eventDate ? e.eventDate.toISOString() : null,
        location: e.location,
        ...countByStatus(e.rsvps),
      }));

      return { events };
    }),
  getEventById: authProcedure
    .input(z.object({ eventId: z.string(), ownerUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await prisma.event.findFirst({
        where: { id: input.eventId, ownerUserId: input.ownerUserId },
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

      if (!row) {
        notFound();
      }
      return { row };
    }),
  createEvent: authProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(3, "Title must be at least 3 characters")
          .max(120, "Title must be a max of 120 characters"),
        description: z.string(),
        location: z.string(),
        eventDate: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let eventId: string | null = null;
      try {
        if (input.title.length < 3 || input.title.length > 120) {
          throw new Error("Event title must be between 3 and 120 characters.");
        }

        const event = await prisma.event.create({
          data: {
            ownerUserId: ctx.userId,
            title: input.title,
            description: input.description,
            location: input.location,
            eventDate: input.eventDate ? new Date(input.eventDate) : null,
          },
        });

        eventId = event.id;
      } catch (err) {
        console.log("AN ERROR OCCURED");
        console.error(err);
      }
      return { id: eventId };
    }),
});
