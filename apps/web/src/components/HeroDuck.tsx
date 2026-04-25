import { useEffect, useRef } from "react";
import gsap from "gsap";
import DuckSwayingSvg from "../../assets/duck_swaying.svg?react";

interface HeroDuckProps {
  children: React.ReactNode;
  canopyRef?: React.RefObject<HTMLDivElement | null>;
}

export default function HeroDuck({
  children,
  canopyRef: externalCanopyRef,
}: HeroDuckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const duckWrapRef = useRef<HTMLDivElement>(null);
  const internalCanopyRef = useRef<HTMLDivElement>(null);
  const canopyRef = externalCanopyRef ?? internalCanopyRef;
  const poleRef = useRef<HTMLDivElement>(null);

  // ── Dynamic pole measurement ──
  useEffect(() => {
    function updatePole() {
      const container = containerRef.current;
      const duck = duckWrapRef.current;
      const canopy = canopyRef.current;
      const pole = poleRef.current;
      if (!container || !duck || !canopy || !pole) return;

      const dRect = duck.getBoundingClientRect();
      const uRect = canopy.getBoundingClientRect();

      let top = dRect.top + dRect.height * 0.5 - uRect.top;
      const duckSvg = duck.querySelector<SVGSVGElement>("svg");
      const footAnchor = duckSvg?.querySelector<SVGGraphicsElement>(
        "#foot, #duck-foot, #foot-front, #foot-3, #foot-back",
      );

      if (duckSvg && footAnchor) {
        const bbox = footAnchor.getBBox();
        const ctm = footAnchor.getScreenCTM();
        if (ctm) {
          const point = duckSvg.createSVGPoint();
          point.x = bbox.x + bbox.width * 0.5;
          point.y = bbox.y + bbox.height * 0.5;
          const footScreen = point.matrixTransform(ctm);
          top = footScreen.y - uRect.top;
        }
      }

      const bottom = uRect.height * 0.5;

      pole.style.top = `${top}px`;
      pole.style.height = `${Math.max(0, bottom - top)}px`;
    }

    updatePole();
    window.addEventListener("resize", updatePole);
    const ro = new ResizeObserver(updatePole);
    if (containerRef.current) ro.observe(containerRef.current);
    if (duckWrapRef.current) ro.observe(duckWrapRef.current);
    if (canopyRef.current) ro.observe(canopyRef.current);

    return () => {
      window.removeEventListener("resize", updatePole);
      ro.disconnect();
    };
  }, []);

  // ── GSAP animations ──
  useEffect(() => {
    const svg =
      duckWrapRef.current?.querySelector<SVGSVGElement>("svg") ?? null;
    const wrapper = duckWrapRef.current;
    const canopy = canopyRef.current;
    const pole = poleRef.current;
    if (!svg || !wrapper || !canopy || !pole) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const selectByIds = (...ids: string[]) =>
      svg.querySelector<SVGElement>(ids.map((id) => `#${id}`).join(", "));

    const eye = selectByIds("duck-eye", "eye");
    const beak = selectByIds("duck-beak", "beak");
    const wingFront = selectByIds("wing-front", "duck-wing-front", "wing");
    const wingBack = selectByIds("wing-back", "duck-wing-back");
    const frontLeg = selectByIds("leg-front");
    const frontLegParts = [
      selectByIds("leg-front"),
      selectByIds("pillar-front"),
      selectByIds("foot-front"),
      selectByIds("leg-highlight"),
      selectByIds("shackle-down"),
      selectByIds("shackle-up"),
    ].filter(Boolean) as SVGElement[];

    const ctx = gsap.context(() => {
      // ── Entrance ──
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(wrapper, { opacity: 0, y: 12, duration: 0.7 })
        .from(canopy, { opacity: 0, y: 12, duration: 0.7 }, 0.15);

      if (prefersReduced) return;

      // ── Bob — duck + pole + canopy float together ──
      entrance.add(() => {
        const sway = gsap.timeline({
          repeat: -1,
          yoyo: true,
          defaults: { duration: 2, ease: "sine.inOut" },
        });
        sway.to(wrapper, { y: -3 }, 0);
        sway.to(canopy, { y: -3 }, 0);
      });

      // Front wing
      if (wingFront) {
        gsap.to(wingFront, {
          rotation: -8,
          duration: 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "100% 50%",
        });
      }

      // Back wing
      if (wingBack) {
        gsap.to(wingBack, {
          rotation: 10,
          duration: 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.15,
          transformOrigin: "100% 100%",
        });
      }

      // Blink
      if (eye) {
        gsap
          .timeline({ repeat: -1, repeatDelay: 3.5 })
          .to(eye, {
            scaleY: 0.1,
            duration: 0.08,
            transformOrigin: "50% 50%",
          })
          .to(eye, {
            scaleY: 1,
            duration: 0.1,
            transformOrigin: "50% 50%",
          });
      }

      // Beak
      if (beak) {
        gsap
          .timeline({ repeat: -1, repeatDelay: 4 })
          .to(beak, {
            rotation: 5,
            duration: 0.15,
            ease: "power2.out",
            transformOrigin: "50% 0%",
          })
          .to(beak, {
            rotation: 0,
            duration: 0.25,
            ease: "power2.inOut",
            transformOrigin: "50% 0%",
          });
      }

      // Front leg sway
      if (frontLegParts.length > 0) {
        gsap.set(frontLegParts, {
          transformBox: "fill-box",
          transformOrigin: "50% 0%",
        });

        gsap.to(frontLegParts, {
          y: -2,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      } else if (frontLeg) {
        gsap.set(frontLeg, {
          transformBox: "fill-box",
          transformOrigin: "50% 0%",
        });

        gsap.to(frontLeg, {
          y: -2,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, containerRef.current ?? undefined);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {/* ── Duck ── */}
      <div
        ref={duckWrapRef}
        className="relative z-10 mb-4 w-40 sm:mb-6 sm:w-56 md:w-70"
      >
        <DuckSwayingSvg
          className="block h-auto w-full"
          role="img"
          aria-label="Duck mascot"
          style={{ overflow: "visible" }}
        />
      </div>

      {/* ── Text content ── */}
      <div className="relative z-10 flex max-w-lg flex-col items-center px-4">
        {children}
      </div>

      {/* ── Umbrella canopy ── */}
      <div
        ref={canopyRef}
        className="relative grid w-40 sm:w-56 md:w-70"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        {/* Pole (between canopy layers) */}
        <div
          ref={poleRef}
          className="absolute left-1/2 -translate-x-1/2 rounded-sm"
          style={{
            width: 4,
            background: "var(--umbrella-pole)",
            zIndex: 5,
          }}
        />

        {/* Canopy dome — in front of pole */}
        <svg
          viewBox="0 0 754 537.01"
          fill="none"
          className="w-full"
          style={{ gridArea: "1/1", isolation: "isolate", zIndex: 10 }}
        >
          <g id="duck-canopy-back">
            <path
              fill="var(--umbrella)"
              d="M570.48,207.91s-77.54,84.85-193.86,17.5c0,0-108.56,66.47-180.93-16.01,0,0-86.42,68.08-185.35-25.86,11.96,133.55,171.36,239.29,366.28,239.29,202.71,0,367.03-114.36,367.03-255.43,0,0-25.85,96.56-173.18,40.5Z"
            />
            <path
              fill="var(--umbrella-stripe-soft)"
              d="M376.62,422.84c173.99-1.74,193.86-214.93,193.86-214.93,0,0-77.54,84.85-193.86,17.5,0,0,10.34,119.3,0,197.43Z"
            />
            <path
              fill="var(--umbrella-stripe-soft)"
              d="M10.34,183.54c11.78,131.47,166.43,235.99,357.2,239.22-34.79-1.71-158.32-21.37-171.85-213.36,0,0-86.42,68.08-185.35-25.86Z"
            />
          </g>

          {/* Decorative bands */}
          <path
            fill="var(--duck-highlight)"
            opacity={0.1}
            d="M375.75,317.19c-92.71,0-179.71,12.13-254.95,33.35,66.1,44.74,156.33,72.3,255.82,72.3,99.23,0,189.25-27.42,255.32-71.95-75.52-21.44-162.97-33.7-256.19-33.7Z"
          />
          <path
            fill="var(--duck-highlight)"
            opacity={0.1}
            d="M376.02,386.58c-56.97,0-109.57,4.9-152.06,13.17,46.49,14.82,98.19,23.09,152.67,23.09,54.3,0,105.84-8.21,152.21-22.94-42.62-8.36-95.51-13.32-152.82-13.32Z"
          />
        </svg>

        {/* Canopy scalloped edge — behind pole */}
        <svg
          viewBox="0 0 754 537.01"
          fill="none"
          className="w-full"
          style={{ gridArea: "1/1", isolation: "isolate", zIndex: 2 }}
        >
          <g id="duck-canopy-front">
            <path
              fill="var(--umbrella-deep)"
              d="M743.66,167.41s-77.77,17.94-106.77-32.53c0,0-84.39,36.24-144.53-20.71,0,0-77.92,62.12-164.91,0,0,0-52.23,66.18-146.74,18.3,0,0-42.9,38.65-110.56,19.24,0,0-15.44,39.09-59.8,31.84l121.02,118.29s170.76,11.65,178.27,14.24c7.52,2.59,155.72,5.18,172.9,5.18,17.18,0,106.32-11.65,120.28-19.41,13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s27.15-33.3,27-68.42Z"
            />
            <path
              fill="var(--umbrella-stripe)"
              d="M458.79,320.96c19.39-46.45,34.34-112.82,33.57-206.79,0,0-77.92,62.12-164.91,0,0,0,4.43,92.44,25.42,204.36,33.36,1.09,78.22,2,105.93,2.43Z"
            />
            <path
              fill="var(--umbrella-stripe)"
              d="M70.15,151.7c25.25,65.08,57.22,114.56,90.92,152.2,28.34,1.99,71.43,5.09,103.96,7.73-68.48-93.03-84.32-179.16-84.32-179.16,0,0-42.9,38.65-110.56,19.24Z"
            />
            <path
              fill="var(--umbrella-stripe)"
              d="M602.82,301.84c13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s27.15-33.3,27-68.42c0,0-77.77,17.94-106.77-32.53,0,0-24.36,96.87-85.71,178.47,23.53-3.67,45.32-7.99,51.65-11.51Z"
            />
            <path
              fill="var(--duck-shadow)"
              opacity={0.15}
              style={{ mixBlendMode: "multiply" }}
              d="M10.34,183.54l121.02,118.29s170.76,11.65,178.27,14.24c7.52,2.59,155.72,5.18,172.9,5.18,17.18,0,106.32-11.65,120.28-19.41,13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s16.92-20.77,23.97-46.79c.54-11.97,1-19.68,1.39-21.24.43-.02,1.12-.06,1.63-.09,0-.01,0-.02,0-.03-.36.02-.88.04-1.62.08h0c-.1.02-.17.03-.27.05.05,0,.11,0,.19,0-19.9,11.98-73.79,54.19-171.47,8.19,0,0-77.54,42.42-193.86,8.75,0,0-108.56,33.24-180.93-8,0,0-87.1,54.92-181.7,8.64-1.97.32-1.93-.37-1.15-1.5-.83-.11-1.65-.2-2.49-.33Z"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
