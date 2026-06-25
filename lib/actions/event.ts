"use server";

import { redirect } from "next/navigation";
import { getSession } from "../auth/server";
import { prisma } from "../prisma";

type formData = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
};

export async function createEventAction(formData: formData) {
  const session = await getSession();
  if (!session.data?.user.id) throw new Error("No userId located");
  const userId = String(session.data.user.id);
  const input = parseCreateEvent(formData);

  try {
    const created = await prisma.event.create({
      data: {
        ownerUserId: userId,
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
      },
    });
    redirect(`/events/${created.id}`);
  } catch (err) {
    console.error(err);
  }
}

function parseCreateEvent(formData: formData) {
  const title = String(formData.title ?? "").trim();

  if (title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }

  const description = String(formData.description ?? "").trim();
  const location = String(formData.location ?? "").trim();
  const eventDate = String(formData.eventDate ?? "").trim();

  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 200) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
}
