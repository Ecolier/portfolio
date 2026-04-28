import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getProjects } from "@/functions/getProjects";
import { getHomePage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import {
  localePath,
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { windState } from "@/lib/canvasState";
import HeroDuck from "#/components/HeroDuck";

const HeroCanvas = lazy(() => import("@/components/HeroCanvas"));

function shouldEnableWindTunnel(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent.toLowerCase();
  const isBot = /(bot|crawl|spider|slurp|googlebot|bingbot|yandex)/i.test(ua);
  if (isBot) return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  if (connection?.saveData) return false;

  const canvas = document.createElement("canvas");
  return !!(
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  );
}

export const Route = createFileRoute("/{-$locale}/")({
  component: Home,
  loader: async ({ context }) => {
    const locale = context.locale;
    const [projects, homePage, siteSettings] = await Promise.all([
      getProjects({ data: locale }),
      getHomePage({ data: locale }),
      getSiteSettings({ data: locale }),
    ]);
    return { projects, homePage, siteSettings };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = (params.locale ?? "en") as Locale;
    const canonical = localePath("/", locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { homePage, siteSettings } = loaderData;
    const title =
      homePage.metaTitle || siteSettings.siteTitle || "Evan Gruère's Portfolio";
    const description =
      homePage.metaDescription ||
      siteSettings.siteDescription ||
      "Portfolio of Evan Gruère, software engineer.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: "Evan Gruère" },
        { property: "og:locale", content: ogLocale(locale) },
        ...ogLocaleAlternates(locale).map((alt) => ({
          property: "og:locale:alternate",
          content: alt,
        })),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }, ...hreflangLinks("/")],
    };
  },
});

function Home() {
  const loaderData = Route.useLoaderData() as {
    projects: Array<{
      id: string;
      slug: string;
      name: string;
      company?: string | null;
      excerpt?: string | null;
      description?: string | null;
      keywords: string[];
      coverImage?: {
        url: string;
        width?: number | null;
        height?: number | null;
      } | null;
      repository?: string | null;
      website?: string | null;
    }>;
    homePage: {
      headline: string;
      subtitle?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
    };
    siteSettings: {
      ui: {
        ctaContact: string;
        navProjects: string;
        ctaViewProjects: string;
      };
      contactEmail?: string | null;
      siteTitle?: string | null;
      siteDescription?: string | null;
    };
  };
  const { projects, homePage, siteSettings } = loaderData;
  const { locale } = Route.useRouteContext();
  const navigate = useNavigate();
  const sectionsRef = useRef<HTMLElement[]>([]);
  const canopyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const markHeroReady = useCallback(() => setHeroReady(true), []);

  useEffect(() => {
    if (!shouldEnableWindTunnel()) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const show = () => {
      timeoutId = setTimeout(() => setShowCanvas(true), 200);
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(show, { timeout: 800 });
    } else {
      show();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  // If the canvas is disabled (bots, reduced motion, old hardware),
  // mark the hero ready immediately so content still fades in.
  useEffect(() => {
    if (shouldEnableWindTunnel()) return;
    const raf = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reveal all hero content together once the canvas has its first frame.
  useGSAP(
    () => {
      if (!heroReady) return;
      gsap.to(
        [heroContentRef.current, canvasWrapRef.current, cueRef.current].filter(
          Boolean,
        ),
        { opacity: 1, duration: 0.55, ease: "power2.out" },
      );
    },
    { dependencies: [heroReady] },
  );

  // ── Measure umbrella canopy relative to hero section ──
  useEffect(() => {
    let raf = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function measure() {
      const el = canopyRef.current;
      const hero = heroRef.current;
      if (!el || !hero) {
        windState.obstacles = [];
        return;
      }

      const cr = el.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      windState.obstacles = [
        {
          x: (cr.left + cr.width / 2 - hr.left) / hr.width,
          y: 1 - (cr.top + cr.height / 2 - hr.top) / hr.height,
          w: cr.width / 2 / hr.width,
          h: cr.height / 2 / hr.height,
        },
      ];
    }

    function scheduleMeasure() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    }

    function syncSampling() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (document.visibilityState === "visible" && isHeroVisible) {
        intervalId = setInterval(scheduleMeasure, 120);
      }
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    if (heroRef.current) resizeObserver.observe(heroRef.current);
    if (canopyRef.current) resizeObserver.observe(canopyRef.current);

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    document.addEventListener("visibilitychange", syncSampling);

    scheduleMeasure();
    syncSampling();

    return () => {
      cancelAnimationFrame(raf);
      if (intervalId) clearInterval(intervalId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("visibilitychange", syncSampling);
      windState.obstacles = [];
    };
  }, [isHeroVisible]);

  // ── Toggle header CTA visibility based on hero intersection ──
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
        document.documentElement.toggleAttribute(
          "data-hero-visible",
          entry.isIntersecting,
        );
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.removeAttribute("data-hero-visible");
    };
  }, []);

  // ── IntersectionObserver: reveal project content ──
  useEffect(() => {
    const sections = sectionsRef.current;
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("project-visible");
          }
        });
      },
      { threshold: 0.45 },
    );

    sections.forEach((s) => {
      if (s) observer.observe(s);
    });

    return () => {
      observer.disconnect();
    };
  }, [projects]);

  // ── Scroll cue: fade on scroll ──
  const cueRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 80 && cueRef.current) {
        cueRef.current.style.opacity = "0";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToSection(idx: number) {
    sectionsRef.current[idx]?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="flex-1">
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative grid snap-start grid-rows-[minmax(0,1fr)_auto] items-center justify-items-center px-4"
        style={{
          height: "calc(100svh - var(--header-h))",
          // DIAGNOSTIC: paint the theme bg directly on the hero section.
          // If the flash still happens, the issue is above this element
          // (paint holding / pre-CSS default / color-scheme race).
          background: "var(--bg-base)",
        }}
      >
        {showCanvas && (
          <div
            ref={canvasWrapRef}
            className="pointer-events-none absolute inset-0 z-0"
            style={{ opacity: 0 }}
          >
            <Suspense>
              <HeroCanvas active={isHeroVisible} onReady={markHeroReady} />
            </Suspense>
          </div>
        )}
        <div
          ref={heroContentRef}
          className="relative z-10 flex min-h-0 flex-col items-center"
          style={{ opacity: 0 }}
        >
          <HeroDuck canopyRef={canopyRef}>
            <h1 className="font-display whitespace-pre-wrap text-center text-4xl font-bold text-(--sea-ink) drop-shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:text-6xl md:text-7xl">
              {homePage.headline}
            </h1>
            {homePage.subtitle && (
              <p className="mt-3 whitespace-pre-wrap text-center text-base text-(--sea-ink-soft) sm:text-lg">
                {homePage.subtitle}
              </p>
            )}
            {siteSettings.contactEmail && (
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="mt-6 inline-block rounded-full border border-(--line) bg-(--surface) px-6 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline shadow-sm backdrop-blur-sm transition hover:bg-(--surface-strong) sm:text-base"
              >
                {siteSettings.ui.ctaContact}
              </a>
            )}
          </HeroDuck>
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          ref={cueRef}
          className="relative z-10 mb-8 flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent text-(--sea-ink-soft) transition-opacity duration-500"
          style={{ opacity: 0 }}
          onClick={() =>
            document
              .getElementById("projects")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <span className="text-xs uppercase tracking-widest">
            {siteSettings.ui.navProjects}
          </span>
          <ArrowDown size={20} className="animate-bounce" aria-hidden="true" />
        </button>
      </section>

      {/* ── Projects: full viewport sections ── */}
      {projects.map((project, i) => (
        <section
          key={project.id}
          ref={(el) => {
            if (el) sectionsRef.current[i] = el;
          }}
          data-project-idx={i}
          id={i === 0 ? "projects" : undefined}
          className="project-section relative flex min-h-svh snap-start flex-col items-center justify-center py-24"
        >
          {/* Content card */}
          <div className="page-wrap project-content relative z-10">
            <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--surface) backdrop-blur-sm">
              {/* Contained cover image */}
              {project.coverImage && (
                <div className="project-cover-wrap">
                  <img
                    src={project.coverImage.url}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    width={project.coverImage.width || 1347}
                    height={project.coverImage.height || 757}
                    className="project-cover aspect-video w-full object-cover"
                  />
                </div>
              )}

              {/* Text content */}
              <div className="p-8 sm:p-10 lg:p-12">
                {project.company && (
                  <p className="island-kicker mb-2">{project.company}</p>
                )}
                <h2 className="font-display text-3xl font-bold text-(--sea-ink) sm:text-5xl md:text-6xl">
                  {project.name}
                </h2>
                {project.excerpt && (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--sea-ink-soft) sm:text-lg">
                    {project.excerpt}
                  </p>
                )}
                {project.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-2.5 py-0.5 text-xs text-(--sea-ink-soft) backdrop-blur-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: localePath(`/projects/${project.slug}`, locale),
                      })
                    }
                    className="fluid-cta rounded-xl border px-5 py-2.5 text-sm font-semibold text-(--sea-ink)"
                  >
                    {siteSettings.ui.ctaViewProjects} →
                  </button>
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
                    >
                      <span className="sr-only">Source code</span>
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        width="18"
                        height="18"
                      >
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
                      className="rounded-lg p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
                    >
                      <span className="sr-only">Visit website</span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation indicator */}
          <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1">
            <span className="text-xs tabular-nums text-(--sea-ink-soft)">
              {i + 1} / {projects.length}
            </span>
            {i < projects.length - 1 ? (
              <button
                type="button"
                onClick={() => scrollToSection(i + 1)}
                className="p-1 text-(--sea-ink-soft) transition hover:text-(--sea-ink)"
                aria-label="Next project"
              >
                <ArrowDown size={20} aria-hidden="true" />
              </button>
            ) : (
              <div className="h-7" />
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
