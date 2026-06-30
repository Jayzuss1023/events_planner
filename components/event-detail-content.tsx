"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { FieldGroup } from "./ui/field";

const inviteFormSchema = z.object({
  eventId: z.string(),
});

export function EventDetailContent({ eventId }: { eventId: string }) {
  const trpc = useTRPC();
  const createInvite = useMutation(
    trpc.event.createInviteActionLink.mutationOptions({}),
  );
  const { data } = useSuspenseQuery(
    trpc.event.getEventByIdandUser.queryOptions({
      eventId: eventId,
    }),
  );
  const event = data.event;
  const rsvps = data.rsvps;

  const form = useForm({
    defaultValues: {
      eventId: "",
    },
    validators: {
      onSubmit: inviteFormSchema,
    },
    onSubmit: async ({}) => {
      try {
        await createInvite.mutateAsync({ eventId });
      } catch (err) {}
    },
  });

  const inviteUrl = event.inviteToken
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${event.inviteToken}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <p>
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date selected"}
            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={"/dashboard"}>Back</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge>Going: {event.goingCount}</Badge>
        <Badge variant="secondary">Maybe: {event.maybeCount}</Badge>
        <Badge variant="outline">Not Going: {event.notGoingCount}</Badge>
      </div>

      <Card>
        <CardHeader>Invite Link</CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Share this link with guests so they can RSVP without creating an
            account.
          </p>
          {inviteUrl ? (
            <div className="rounded-md border border-border bg-surface p-3 text-sm">
              {inviteUrl}
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground">
                No invite link generated yet.
              </p>
              <form
                id="invite-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <Button type="submit">Generate Link</Button>
                </FieldGroup>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No responses yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell>{rsvp.name}</TableCell>
                    <TableCell>{rsvp.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {rsvp.status === "not_going"
                          ? "Not Going"
                          : rsvp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(rsvp.respondedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
