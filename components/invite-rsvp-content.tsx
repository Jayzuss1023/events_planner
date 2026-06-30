"use client";
import { useTRPC } from "@/trpc/client";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { useRouter } from "next/navigation";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

const RSVP_STATUSES = [
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "not_going", label: "Not Going" },
];

const rsvpActionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be more than 3 characters")
    .max(20, "Name must be less than 20 characters"),
  email: z
    .email("This is not a valid email")
    .min(1, "This field has to be filled"),
  status: z.string(),
});

export function InviteRsvpContent({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.event.getEventInvite.queryOptions({
      token,
    }),
  );
  const rsvpAction = useMutation(trpc.event.rsvpAction.mutationOptions({}));

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      status: "",
    },
    validators: {
      onSubmit: rsvpActionSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("firing");
      try {
        console.log("firing");
        await rsvpAction.mutateAsync({
          token,
          name: value.name,
          email: value.email,
          status: value.status,
        });
        router.push(`/invite/${token}?submitted=1`);
        console.log("submitted");
      } catch (err) {
        console.log("an error occured", err);
      }
    },
  });

  const event = data.event;
  return (
    <div>
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            RSVP
          </Badge>
          <CardTitle>{event.title}</CardTitle>
          <p>
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date selected"}
          </p>
          {event.description ? (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          ) : (
            '"No details'
          )}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p>Thanks. Your RSVP has been recorded (or updated)</p>
          ) : null}
          <form
            id="rsvp-form"
            onSubmit={(e) => {
              console.log("submitting");
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        placeholder="Your name"
                      />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        placeholder="email@example.com"
                      />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="status"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel>Attendance</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {RSVP_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" form="rsvp-form">
              Submit RSVP
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
