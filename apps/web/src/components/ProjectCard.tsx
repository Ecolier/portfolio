import type { CSSProperties, MouseEvent } from "react";
import type { Project } from "../functions/getProjects";
import { useFluidTransition } from "../hooks/useFluidTransition";
import { fluidState } from "./TrippyPlane";

// Maps phase index (0=A, 1=B, 2=C) to a CSS accent color
const PHASE_ACCENTS = [
  "var(--phase-a, rgba(220,180,180,0.5))",
  "var(--phase-b, rgba(180,200,220,0.5))",
  "var(--phase-c, rgba(200,220,200,0.5))",
];

export default function ProjectCard({
  project,
  phase,
  style,
}: {
  project: Project;
  phase: number;
  style?: CSSProperties;
}) {
  const navigateWithTransition = useFluidTransition();

  function handleClick(e: MouseEvent) {
    // Don't intercept clicks on external links
    if ((e.target as HTMLElement).closest("a")) return;
    e.preventDefault();
    navigateWithTransition(`/projects/${project.slug}?phase=${phase}`, phase);
  }

  function handleMouseEnter(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const aspect = window.innerWidth / window.innerHeight;
    fluidState.hoveredPhase = phase;
    fluidState.hoveredX = (centerX / window.innerWidth - 0.5) * aspect;
    fluidState.hoveredY = -(centerY / window.innerHeight - 0.5);
  }

  function handleMouseLeave() {
    fluidState.hoveredPhase = -1;
  }

  return (
    <article
      data-card
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="feature-card cursor-pointer rounded-2xl border border-(--line) p-5 opacity-0 backdrop-blur-sm sm:p-6"
      style={{
        ...style,
        borderLeftWidth: 3,
        borderLeftColor: PHASE_ACCENTS[phase % 3],
      }}
    >
      {project.company && (
        <p className="island-kicker mb-1.5">{project.company}</p>
      )}

      <h3 className="display-title mb-2 text-xl font-bold text-(--sea-ink) sm:text-2xl">
        {project.name}
      </h3>

      {project.description && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-(--sea-ink-soft)">
          {project.description}
        </p>
      )}

      {project.keywords.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-2.5 py-0.5 text-xs text-(--sea-ink-soft)"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {project.repository && (
          <a
            href={project.repository}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
          >
            <span className="sr-only">Source code</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="18" height="18">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        )}
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
          >
            <span className="sr-only">Visit website</span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M5.5 14.5 14.5 5.5M14.5 5.5H8M14.5 5.5V12"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
