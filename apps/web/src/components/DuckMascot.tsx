import { useEffect, useRef } from "react";
import gsap from "gsap";

interface DuckMascotProps {
  children: React.ReactNode;
  canopyRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DuckMascot({
  children,
  canopyRef: externalCanopyRef,
}: DuckMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const duckSvgRef = useRef<SVGSVGElement>(null);
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

      const top = dRect.top + dRect.height * 0.88 - uRect.top;
      const bottom = uRect.height * 0.5;

      pole.style.top = `${top}px`;
      pole.style.height = `${Math.max(0, bottom - top)}px`;
    }

    updatePole();
    window.addEventListener("resize", updatePole);
    const ro = new ResizeObserver(updatePole);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updatePole);
      ro.disconnect();
    };
  }, []);

  // ── GSAP animations ──
  useEffect(() => {
    const svg = duckSvgRef.current;
    const wrapper = duckWrapRef.current;
    const canopy = canopyRef.current;
    const pole = poleRef.current;
    if (!svg || !wrapper || !canopy || !pole) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const eye = svg.querySelector<SVGElement>("#duck-eye");
    const beak = svg.querySelector<SVGElement>("#duck-beak");
    const wingFront = svg.querySelector<SVGElement>("#duck-wing-front");
    const wingBack = svg.querySelector<SVGElement>("#duck-wing-back");
    const foot = svg.querySelector<SVGElement>("#duck-foot");

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
      gsap.to(wingFront, {
        rotation: -8,
        duration: 0.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "100% 50%",
      });

      // Back wing
      gsap.to(wingBack, {
        rotation: 10,
        duration: 0.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.15,
        transformOrigin: "100% 100%",
      });

      // Blink
      gsap
        .timeline({ repeat: -1, repeatDelay: 3.5 })
        .to(eye, {
          scaleY: 0.1,
          duration: 0.08,
          transformOrigin: "50% 50%",
        })
        .to(eye, { scaleY: 1, duration: 0.1, transformOrigin: "50% 50%" });

      // Beak
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

      // Raised foot sway
      gsap.to(foot, {
        rotation: 4,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "0% 100%",
      });
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
        <svg
          ref={duckSvgRef}
          viewBox="0 0 754 537.01"
          fill="none"
          className="w-full"
          role="img"
          aria-label="Duck mascot"
          style={{ overflow: "visible" }}
        >
          <defs>
            <clipPath id="duck-clip-foot">
              <path d="M457.65,392.76c-12.73-12.73-12.73-25.46,0-38.18,19.09-19.09,89.09-89.1,89.09-89.1,12.73-12.73,25.46-12.73,38.18,0s12.73,25.46,0,38.18l-89.09,89.09c-12.73,12.73-25.46,12.73-38.18,0Z" />
            </clipPath>
            <clipPath id="duck-clip-beak">
              <rect
                x="320.46"
                y="-7.91"
                width="54"
                height="108"
                rx="27"
                ry="27"
                transform="translate(134.36 -232.19) rotate(45)"
              />
            </clipPath>
            <clipPath id="duck-clip-foot2">
              <path d="M330.79,510.01c0-18,9-27,27-27,27,0,126,0,126,0,18,0,27,9,27,27s-9,27-27,27h-126c-18,0-27-9-27-27Z" />
            </clipPath>
          </defs>

          {/* Raised foot */}
          <g id="duck-foot">
            <path
              fill="var(--duck-feet)"
              d="M457.65,392.76c-12.73-12.73-12.73-25.46,0-38.18,19.09-19.09,89.09-89.1,89.09-89.1,12.73-12.73,25.46-12.73,38.18,0s12.73,25.46,0,38.18l-89.09,89.09c-12.73,12.73-25.46,12.73-38.18,0Z"
            />
            <g clipPath="url(#duck-clip-foot)">
              <rect
                fill="var(--duck-highlight)"
                opacity={0.12}
                x="467.84"
                y="286.99"
                width="126"
                height="27"
                rx="13.5"
                ry="13.5"
                transform="translate(-57 463.37) rotate(-45)"
              />
            </g>
          </g>

          <g>
            {/* Back wing */}
            <g id="duck-wing-back">
              <path
                fill="var(--duck-body-dark)"
                d="M203.07,266.6c35.34,12.02,175.91,69.19,214.8-35.55,25.03-67.41-38.38-129.35-139.62-166.94C153.79,17.9,25.69,123.95.63,191.44c-2.62,6.92-.05-.02,67.44,25.04,33.75,12.53,134.99,50.12,134.99,50.12Z"
              />
            </g>

            {/* Body */}
            <path
              id="duck-body"
              fill="var(--duck-body)"
              d="M131.09,517.02c-28.23-28.23-50.91-101.82,76.37-229.1,76.37-76.37,58.9-93.84,0-152.73-38.18-38.18-25.46-76.37,0-101.82,25.46-25.46,63.64-38.18,101.82,0,16.81,16.81,5.56,5.56,50.91,50.91,51.39,51.39,63.64,38.18,114.55,89.1,76.84,76.84,12.73,190.92-25.45,229.1-63.64,63.64-114.55,114.55-146.37,82.73-19.09-19.09-25.45-25.46-44.55-44.55-16.86-16.86-50.91,0-76.37,25.46-50.91,50.91-44.55,57.28-50.91,50.91Z"
            />

            {/* Body highlight */}
            <path
              fill="var(--duck-highlight)"
              opacity={0.06}
              d="M495.66,239.23c-2.38.45-4.67-1.06-5.22-3.42-4.33-18.46-13.72-35.01-27.96-49.24-23.84-23.84-38.38-32.58-53.77-41.84-16.69-10.04-33.94-20.41-61.25-47.73l-47.73-47.73c-1.76-1.76-1.76-4.61,0-6.36h0c1.76-1.76,4.61-1.76,6.36,0l47.73,47.73c26.53,26.53,43.31,36.62,59.53,46.38,15.88,9.55,30.88,18.58,55.5,43.19,15.45,15.45,25.65,33.46,30.36,53.59.58,2.48-1.05,4.95-3.55,5.43h0Z"
            />

            <g>
              {/* Front wing */}
              <g id="duck-wing-front">
                <path
                  fill="var(--duck-body-soft)"
                  d="M228.46,338.65c37.32-1.03,189,3.73,189-108,0-71.91-81-108-189-108-132.76,0-216,144-216,216-.05,7.4,0,0,72,0,36,0,144,0,144,0Z"
                />
                {/* Belly highlight */}
                <g opacity={0.06}>
                  <path
                    fill="var(--duck-highlight)"
                    d="M143.07,154.82c27.02-14.93,55.75-22.5,85.4-22.5,53.72,0,98.94,8.97,130.77,25.93,32.67,17.41,49.23,41.97,49.23,72.98,0,41.21-289.36-63.17-265.4-76.41Z"
                  />
                </g>
              </g>
            </g>

            {/* Beak */}
            <g id="duck-beak">
              <rect
                fill="var(--duck-beak)"
                x="320.46"
                y="-7.91"
                width="54"
                height="108"
                rx="27"
                ry="27"
                transform="translate(134.36 -232.19) rotate(45)"
              />
              <g clipPath="url(#duck-clip-beak)">
                <path
                  fill="var(--duck-highlight)"
                  opacity={0.12}
                  d="M385.64,7.91l-41.37,41.37c-5.27,5.27-13.82,5.27-19.09,0h0c-5.27-5.27-5.27-13.82,0-19.09l41.37-41.37,19.09,19.09Z"
                />
              </g>
            </g>

            {/* Eye */}
            <path
              id="duck-eye"
              fill="var(--duck-eye)"
              d="M239.7,41.15h0c13.19-6.75,29.59-1.45,36.33,11.74,6.75,13.19,1.45,29.59-11.74,36.33-8.58,4.39-18.88,3.86-26.97-1.37h0c9.08-14.03,9.98-31.83,2.37-46.7Z"
            />
          </g>

          {/* Standing leg with bands */}
          <g id="duck-leg-front">
            <path
              fill="var(--duck-body)"
              d="M366.79,384.01h54c0,36.44,0,61.7,0,99-18,0-36,0-54,0,0-36.79,0-62.05,0-99Z"
            />
            <path
              fill="var(--umbrella-pole-soft)"
              d="M357.79,465.01h72c4.97,0,9,4.03,9,9h-90c0-4.97,4.03-9,9-9Z"
            />
            <path
              fill="var(--umbrella-pole)"
              d="M348.79,456.01h90c0,4.97-4.03,9-9,9h-72c-4.97,0-9-4.03-9-9h0Z"
            />
            <path
              fill="var(--umbrella-pole)"
              d="M348.79,474.01h90c0,4.97-4.03,9-9,9h-72c-4.97,0-9-4.03-9-9h0Z"
            />
            <path
              fill="var(--umbrella-pole-soft)"
              d="M357.79,447.01h72c4.97,0,9,4.03,9,9h-90c0-4.97,4.03-9,9-9Z"
            />

            {/* Standing foot */}
            <g id="duck-foot-2">
              <path
                fill="var(--duck-feet)"
                d="M330.79,510.01c0-18,9-27,27-27,27,0,126,0,126,0,18,0,27,9,27,27s-9,27-27,27h-126c-18,0-27-9-27-27Z"
              />
              <g clipPath="url(#duck-clip-foot2)">
                <rect
                  fill="var(--duck-highlight)"
                  opacity={0.12}
                  x="384.79"
                  y="483.01"
                  width="126"
                  height="27"
                  rx="13.5"
                  ry="13.5"
                />
              </g>
            </g>

            {/* Leg highlight */}
            <g opacity={0.06}>
              <path
                fill="var(--duck-highlight)"
                d="M411.79,483.01v-103.5c0-2.49,2.01-4.5,4.5-4.5h0c2.49,0,4.5,2.01,4.5,4.5v103.5s-9,0-9,0Z"
              />
            </g>
          </g>
        </svg>
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
