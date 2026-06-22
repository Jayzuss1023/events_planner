import Link from "next/link";
import { Button } from "./ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export async function DashboardContent({
  userId,
}: {
  userId: string | undefined;
}) {
  return (
    <div>
      <div>
        <div>
          <h1>Your Events</h1>
          <p> Track attendee responses and manage invite links.</p>
        </div>

        <Button asChild>
          <Link href={"/events/new"}>Create event</Link>
        </Button>
      </div>

      {/* List of events */}
    </div>
  );
}
