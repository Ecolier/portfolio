import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { RouterContext } from "./routes/__root";

function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-(--sea-ink)">404</h1>
      <p className="text-lg text-(--sea-ink-soft)">This page doesn't exist.</p>
      <a
        href="/"
        className="mt-2 inline-block rounded-full border border-(--line) bg-(--surface) px-6 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline transition hover:bg-(--surface-strong)"
      >
        Back to home
      </a>
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-(--sea-ink)">
        Something went wrong
      </h1>
      <p className="max-w-md text-base text-(--sea-ink-soft)">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-block rounded-full border border-(--line) bg-(--surface) px-6 py-2.5 text-sm font-semibold text-(--sea-ink) transition hover:bg-(--surface-strong)"
      >
        Try again
      </button>
    </div>
  );
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: DefaultError,
    context: { locale: "en" } satisfies RouterContext,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
