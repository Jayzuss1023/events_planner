"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function DashboardContent({ userId }: { userId: string | undefined }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.event.getUserEvents.queryOptions());

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Events</h1>
          <p className="text-sm text-muted-foreground">
            Track attendee responses and manage invite links.
          </p>
        </div>

        <Button asChild>
          <Link href={"/events/new"}>Create event</Link>
        </Button>
      </div>

      {/* List of events */}
      {data.events.length == 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create your first event to start collecting RSVPs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Button size="sm" asChild>
                    <Link href={`/events/${event.id}`}>Open</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>Going: {event.goingCount}</Badge>
                  <Badge variant="secondary">Maybe: {event.maybeCount}</Badge>
                  <Badge variant="outline">
                    {" "}
                    Not Going: {event.notGoingCount}
                  </Badge>
                </div>
                <p>
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleString()
                    : "No date selected"}
                  {event.location ? ` - ${event.location}` : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
