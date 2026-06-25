import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  prefetch(trpc.event.getUserEvents.queryOptions());
  return (
    <HydrateClient>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    </HydrateClient>
  );
}
