import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { RouterContext } from "./routes/__root";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime.js";
import { m } from "./paraglide/messages.js";

function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="type-heading">{m.not_found_title()}</h1>
      <p className="type-lede">{m.not_found_message()}</p>
      <a
        href="/"
        className="type-button mt-2 inline-block rounded-full border px-6 py-2.5 no-underline"
      >
        {m.not_found_home()}
      </a>
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="type-title">{m.error_title()}</h1>
      <p className="type-body max-w-md">
        {error.message || m.error_fallback()}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="type-button mt-2 inline-block rounded-full border px-6 py-2.5"
      >
        {m.error_try_again()}
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
    defaultViewTransition: true,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    context: { locale: "en", initialTheme: "light" } satisfies RouterContext,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface StaticDataRouteOption {
    pageClass?: string;
  }
}
