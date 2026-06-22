"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createEventAction } from "@/lib/actions/event";
import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import z from "zod";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  eventDate: z.string(),
});

export default function NewEventPage() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      eventDate: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      createEventAction(value);
      form.reset();
    },
  });
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="event-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        placeholder="Team dinner..."
                      />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  return (
                    <Field>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Optional details about the event"
                      />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="location"
                children={(field) => {
                  return (
                    <Field>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Optional Location"
                      />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="eventDate"
                children={(field) => {
                  return (
                    <Field>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="datetime-local"
                      />
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" form="event-form">
              Create Event
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={"/dashboard"}>Canvel</Link>
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
