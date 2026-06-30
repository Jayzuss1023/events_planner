import { prisma } from "@/lib/prisma";
import { router, publicProcedure, authProcedure } from "../init";
import { z } from "zod";
import { getSession } from "@/lib/auth/server";
import type {
  RsvpStatus as PrismaRsvpStatus,
  RsvpStatus,
} from "@/app/generated/prisma/enums";
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
  getEventInvite: authProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await prisma.eventInvite.findFirst({
        where: { token: input.token },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              eventDate: true,
            },
          },
        },
      });

      if (!row) {
        notFound();
      }

      const e = row.event;

      const event = {
        title: e.title,
        description: e.description,
        location: e.location,
        eventDate: e.eventDate ? e.eventDate.toISOString() : null,
      };

      return { event };
    }),
  getEventByIdandUser: authProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [row, rsvpRows] = await Promise.all([
        prisma.event.findFirst({
          where: { id: input.eventId, ownerUserId: ctx.userId },
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            eventDate: true,
            invite: { select: { token: true } },
            rsvps: { select: { status: true } },
          },
        }),
        prisma.eventRsvp.findMany({
          where: { eventId: input.eventId },
          orderBy: { respondedAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            respondedAt: true,
          },
        }),
      ]);

      if (!row) {
        notFound();
      }

      const counts = countByStatus(row.rsvps);

      const event = {
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        eventDate: row.eventDate ? row.eventDate.toISOString() : null,
        inviteToken: row.invite?.token ?? null,
        goingCount: counts.goingCount,
        maybeCount: counts.maybeCount,
        notGoingCount: counts.notGoingCount,
      };

      const rsvps = rsvpRows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        respondedAt: r.respondedAt.toISOString(),
      }));

      return { event, rsvps };
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
  createInviteActionLink: authProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const owns = await prisma.event.findFirst({
        where: { id: input.eventId, ownerUserId: ctx.userId },
        select: { id: true },
      });

      if (!owns) {
        throw new Error("Event not found");
      }

      const token = crypto.randomUUID().replace(/-/g, "");

      await prisma.eventInvite.upsert({
        where: { eventId: input.eventId },
        create: { eventId: input.eventId, token },
        update: { token },
      });
    }),
  rsvpAction: authProcedure
    .input(
      z.object({
        token: z.string(),
        name: z
          .string()
          .min(2, "Name must be more than 3 characters")
          .max(20, "Name must be less than 20 characters"),
        email: z
          .email("This is not a valid email")
          .min(1, "This field has to be filled"),
        status: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const invite = await prisma.eventInvite.findFirst({
        where: { token: input.token },
        select: {
          id: true,
          event: {
            select: { id: true },
          },
        },
      });

      if (!invite) {
        throw new Error("invite link is invalid");
      }

      const eventId = invite.event.id;
      const emailNormalized = input.email.toLowerCase();

      const newRsvp = await prisma.eventRsvp.upsert({
        where: {
          eventId_emailNormalized: {
            eventId,
            emailNormalized,
          },
        },
        create: {
          eventId,
          inviteId: invite.id,
          name: input.name,
          email: input.email,
          emailNormalized,
          status: input.status as RsvpStatus,
        },
        update: {
          name: input.name,
          status: input.status as RsvpStatus,
          respondedAt: new Date(),
        },
      });
      console.log(newRsvp);
    }),
});
