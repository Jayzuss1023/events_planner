import { router } from "../init";
import { eventsRouter } from "./events";

export const appRouter = router({
	event: eventsRouter,
});

export type AppRouter = typeof appRouter;
