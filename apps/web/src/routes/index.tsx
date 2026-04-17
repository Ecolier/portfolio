import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { getProjects } from "../functions/getProjects";
import { getHomePage } from "../functions/getGlobals";
import ProjectCard from "../components/ProjectCard";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const [projects, homePage] = await Promise.all([
      getProjects(),
      getHomePage(),
    ]);
    return { projects, homePage };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: () => ({
    meta: [
      { title: "Evan Gruère | Software Engineer — Projects & Work" },
      {
        name: "description",
        content:
          "Portfolio of Evan Gruère, a software engineer showcasing full-stack projects, open-source contributions, and technical expertise.",
      },
      { property: "og:title", content: "Evan Gruère | Software Engineer" },
      {
        property: "og:description",
        content:
          "Explore projects and work by Evan Gruère — full-stack software engineer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Evan Gruère | Software Engineer" },
      {
        name: "twitter:description",
        content: "Portfolio of Evan Gruère — full-stack software engineer.",
      },
    ],
    links: [{ rel: "canonical", href: "https://gruere.dev/" }],
  }),
});

function App() {
  const { projects, homePage } = Route.useLoaderData();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("rise-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [projects]);

  return (
    <main className="flex-1">
      {/* Hero — let the simulation breathe */}
      <section className="flex min-h-svh items-center justify-center">
        <h1 className="display-title rise-in text-center text-4xl font-bold text-(--sea-ink) drop-shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:text-6xl md:text-7xl">
          {homePage.headline}
        </h1>
      </section>

      {/* Projects */}
      <section className="page-wrap px-4 pb-24">
        <p className="island-kicker mb-6">Projects</p>
        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              phase={i % 3}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
