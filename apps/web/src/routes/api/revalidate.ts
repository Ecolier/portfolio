import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/revalidate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { secret, paths } = await request.json();

        if (secret !== process.env.REVALIDATE_SECRET) {
          return Response.json({ error: "Invalid token" }, { status: 401 });
        }

        if (process.env.CF_ZONE_ID && process.env.CF_API_TOKEN) {
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                files: (paths as string[]).map(
                  (p) => `${process.env.SITE_URL}${p}`,
                ),
              }),
            },
          );
        }

        return Response.json({ revalidated: true, paths });
      },
    },
  },
});
