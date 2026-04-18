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
  const duckRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const internalCanopyRef = useRef<HTMLDivElement>(null);
  const canopyRef = externalCanopyRef ?? internalCanopyRef;

  useEffect(() => {
    const svg = duckRef.current;
    const wrapper = wrapperRef.current;
    const canopy = canopyRef.current;
    if (!svg || !wrapper || !canopy) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const eye = svg.querySelector<SVGElement>("[data-duck=eye]")!;
    const beak = svg.querySelector<SVGElement>("[data-duck=beak]")!;
    const wing = svg.querySelector<SVGElement>("[data-duck=wing]")!;
    const wingBack = svg.querySelector<SVGElement>("[data-duck=wing-back]")!;
    const leg2 = svg.querySelector<SVGElement>("[data-duck=leg2]")!;

    const ctx = gsap.context(() => {
      // ── Entrance ──
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(wrapper, { opacity: 0, y: 12, duration: 0.7 })
        .from(canopy, { opacity: 0, y: 12, duration: 0.7 }, 0.15);

      if (prefersReduced) return;

      // ── Looping animations ──

      // Duck + canopy bob together — start after entrance to avoid y conflict
      entrance.add(() => {
        const sway = gsap.timeline({
          repeat: -1,
          yoyo: true,
          defaults: { duration: 2, ease: "sine.inOut" },
        });
        sway.to(wrapper, { y: -3 }, 0);
        sway.to(canopy, { y: -3 }, 0);
      });

      // Front wing — steady flapping like bird flight
      gsap.to(wing, {
        rotation: -8,
        duration: 0.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "100% 50%",
      });

      // Back wing — same flap, slightly offset and wider
      gsap.to(wingBack, {
        rotation: 10,
        duration: 0.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.15,
        transformOrigin: "100% 100%",
      });

      // Blink — squish the eye group vertically
      gsap
        .timeline({ repeat: -1, repeatDelay: 3.5 })
        .to(eye, {
          scaleY: 0.1,
          duration: 0.08,
          transformOrigin: "50% 50%",
        })
        .to(eye, { scaleY: 1, duration: 0.1, transformOrigin: "50% 50%" });

      // Beak opens slightly — rotate around hinge point
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

      // Raised leg sways left to right
      gsap.to(leg2, {
        rotation: 4,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "0% 0%",
      });
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* ── Duck ── */}
      <div ref={wrapperRef} className="relative z-10 -mb-2">
        <svg
          ref={duckRef}
          viewBox="0 0 738.86 870"
          width="240"
          fill="none"
          role="img"
          aria-label="Duck mascot"
          style={{ overflow: "visible" }}
        >
          <defs>
            <clipPath id="duck-foot-left-clip">
              <rect
                fill="#ff9e00"
                x="540.45"
                y="572.14"
                width="54"
                height="180"
                rx="27"
                ry="27"
                transform="translate(634.41 -207.31) rotate(45)"
              />
            </clipPath>
            <clipPath id="duck-foot-right-clip">
              <path
                fill="#ff9e00"
                d="M353.32,718.62s0,0,0,0c10.33,10.12,10.38,22.03-.08,30.02-29.6,22.46-57.21,54.61-80.1,95.91-8.06,14.58-24.72,21.95-37.91,13.06h0c-13.19-8.8-16.92-30.94-7.78-46.01,25.44-42.47,55.35-75.56,86.97-98.84,11.31-8.34,28.58-4.18,38.91,5.86Z"
              />
            </clipPath>
            <clipPath id="duck-eye-clip">
              <circle cx="437.18" cy="112.5" r="27" />
            </clipPath>
            <clipPath id="duck-beak-clip">
              <rect
                fill="#ff6400"
                x="495.68"
                y="98.19"
                width="54"
                height="117"
                rx="27"
                ry="27"
                transform="translate(424.95 -380.14) rotate(62.99)"
              />
            </clipPath>
          </defs>

          {/* Left leg (raised) */}
          <g data-duck="leg2">
            <path
              fill="var(--duck-body)"
              d="M363.31,528.32c11.14-14.21,21.71-29.28,31.64-45.17,15.95,11.59,56.76,43.72,92.32,85.33,36.2,40.47,67.15,90.43,78.28,111.38-14.71,15.99-29.93,31.03-45.57,45.1-9.66-20.48-37.27-70.08-70.57-110.6-32.62-41.63-70.92-74.18-86.1-86.04Z"
            />
            <path
              fill="var(--duck-body-soft)"
              d="M509.57,651.51c-27.11-55.06-64.4-99.21-106-130.63-3.44-2.61-3.89-7.87-1.09-12.02h0c2.81-4.14,7.93-5.61,11.5-3.02,43.03,31.25,81.97,75.37,110.96,130.66,2.42,4.58.84,11.86-3.49,15.99h0c-4.34,4.14-9.65,3.58-11.88-.98Z"
            />
            <rect
              fill="var(--duck-feet)"
              x="540.45"
              y="572.14"
              width="54"
              height="180"
              rx="27"
              ry="27"
              transform="translate(634.41 -207.31) rotate(45)"
            />
            <g clipPath="url(#duck-foot-left-clip)">
              <path
                fill="#fff"
                opacity="0.25"
                d="M532.45,678.08h0c-5.27-5.27-5.27-13.95,0-18.95,23.25-22.2,46.68-42.23,70.09-66.99,5.28-5.55,13.81-6.81,19.04-2.5h0c5.23,4.31,5.24,13,0,18.95-23.26,26.25-46.75,47.15-70.03,69.59-5.27,5.06-13.82,5.16-19.09-.11Z"
              />
            </g>
          </g>

          {/* Wing (behind body) */}
          <g data-duck="wing-back">
            <path
              fill="var(--duck-body-dark)"
              d="M398.2,340.94c-16.05,13.71-48.94,16.49-64.17,17.77-13.12,1.11-41.42,2.05-74.65-9.4-45.95-15.84-82.96-48.55-104.19-92.12L45.7,32.53c-.99-2.04-.92-3.98.21-5.79,1.78-2.84,5.69-4.67,6.28-4.89,128.67-47.87,220.18-2.17,220.18-2.17,136.78,68.32,175.62,278.72,125.83,321.25Z"
            />
          </g>

          {/* Body */}
          <g data-duck="body">
            <path
              fill="var(--duck-body)"
              d="M41.18,400.5c-36,0,72-108,216-108,90,0,85.61,2.68,85.61-40.5V108c0-72,144-72,144,0,0,45-.34,281.72-.03,296.78.11,5.5.46,69.12-44.71,111.39-51.1,47.82-146.5,52.38-220.87,1.33,0,0,0-117-180-117Z"
            />
          </g>

          {/* Right leg */}
          <g data-duck="legs">
            <path
              fill="var(--duck-body)"
              d="M289.51,466.88c17.68,3.37,35.36,6.75,53.04,10.12-4.43,21.83-13.22,78.15-12.68,134.6-.59,56.45,8.14,113.04,12.68,135.4-17.68,3.37-35.36,6.75-53.04,10.12-4.81-23.7-14.23-84.35-13.63-145.04-.61-60.68,8.8-121.39,13.63-145.2Z"
            />
            <path
              fill="var(--duck-body-soft)"
              d="M317.8,706.05c-8.51-66.28-7.99-133.43,1.57-199.6.79-5.49,5.48-9.3,10.39-8.51h0c4.91.79,8.19,5.75,7.42,11.08-9.32,64.56-9.83,130.07-1.53,194.73.68,5.34-2.68,10.25-7.6,10.96h0c-4.92.71-9.55-3.16-10.25-8.67Z"
            />
            <path
              fill="var(--duck-feet)"
              d="M353.32,718.62s0,0,0,0c10.33,10.12,10.38,22.03-.08,30.02-29.6,22.46-57.21,54.61-80.1,95.91-8.06,14.58-24.72,21.95-37.91,13.06h0c-13.19-8.8-16.92-30.94-7.78-46.01,25.44-42.47,55.35-75.56,86.97-98.84,11.31-8.34,28.58-4.18,38.91,5.86Z"
            />
            <g clipPath="url(#duck-foot-right-clip)">
              <path
                fill="#fff"
                opacity="0.25"
                d="M339.92,694.87s0,0,0,0c4.86,5.8,4.35,12.67-1.26,16.2-24.86,15.61-48.91,37.26-70.81,64.79-4.93,6.2-13.64,7.51-19.53,2.07t0,0c-5.88-5.42-6.46-15.63-1.26-21.93,22.91-27.91,47.89-49.87,73.59-65.76,5.83-3.61,14.4-1.15,19.26,4.63Z"
              />
            </g>
          </g>

          {/* Wing / belly (front) */}
          <g data-duck="wing">
            <path
              fill="var(--duck-body-soft)"
              d="M353.2,377.6c-16.05,13.71-48.94,16.49-64.17,17.77-13.12,1.11-41.42,2.05-74.65-9.4-45.95-15.84-82.96-48.55-104.19-92.12L.7,69.2c-.99-2.04-.92-3.98.21-5.79,1.78-2.84,5.69-4.67,6.28-4.89,128.67-47.87,220.18-2.17,220.18-2.17,136.78,68.32,175.62,278.72,125.83,321.25Z"
            />
            <path
              fill="var(--duck-body)"
              d="M120.4,288.88L12.99,68.49c62.97-23.04,116.22-22.48,149.93-17.9,36.99,5.02,59.19,15.83,59.4,15.94l5.05-10.17h0S135.85,10.65,7.19,58.52c-.59.22-4.5,2.06-6.28,4.89-1.13,1.8-1.2,3.75-.21,5.79l109.49,224.65,10.21-4.98Z"
            />
            <path
              fill="#fff"
              opacity="0.06"
              d="M279.58,208.75c29.07-14.63,64.51.84,73.05,32.25,5.37,19.74,8.69,39.45,9.68,58.15,1.78,33.38-4.38,59.48-16.49,69.82-13.27,11.34-44.44,13.97-57.75,15.09-23.33,1.97-47.53-1.08-70-8.82-43.09-14.85-77.78-45.52-97.68-86.36l159.18-80.13Z"
            />
          </g>

          {/* Eye */}
          <g data-duck="eye">
            <circle fill="var(--duck-eye)" cx="437.18" cy="112.5" r="27" />
            <g clipPath="url(#duck-eye-clip)">
              <ellipse
                fill="var(--duck-body)"
                cx="410.77"
                cy="95.77"
                rx="40.5"
                ry="22.5"
                transform="translate(52.59 318.51) rotate(-45)"
              />
            </g>
          </g>

          {/* Beak */}
          <g data-duck="beak">
            <rect
              fill="var(--duck-beak)"
              x="495.68"
              y="98.19"
              width="54"
              height="117"
              rx="27"
              ry="27"
              transform="translate(424.95 -380.14) rotate(62.99)"
            />
            <g clipPath="url(#duck-beak-clip)">
              <rect
                fill="#fff"
                opacity="0.25"
                x="491.23"
                y="123.19"
                width="81.9"
                height="27"
                rx="13.5"
                ry="13.5"
                transform="translate(-4.04 256.55) rotate(-27.01)"
              />
            </g>
          </g>

          {/* Extension rects — grown tall to bridge duck → canopy */}
          <rect
            fill="var(--umbrella-pole-soft)"
            x={372.42}
            y={1010.46}
            width={8.56}
            height={480}
          />
          <rect
            fill="var(--umbrella-pole)"
            x={363.86}
            y={1010.46}
            width={8.56}
            height={480}
          />

          {/* Stick upper (handle → extension) */}
          <path
            fill="var(--umbrella-pole-soft)"
            d="M380.98,1010.46v-179.61c0-4.71-3.85-8.56-8.56-8.56h0c-4.71,0-8.56,3.85-8.56,8.56v179.61"
          />
          <path
            fill="var(--umbrella-pole)"
            d="M372.42,1010.46v-179.61c0-3.14,1.74-5.88,4.28-7.36-1.26-.74-2.71-1.2-4.28-1.2h0c-4.71,0-8.56,3.85-8.56,8.56v179.61"
          />

          {/* Umbrella handle */}
          <g data-duck="handle">
            <path
              fill="var(--umbrella-deep)"
              d="M354.04,834.5s31.1,6.94,38.05-5.58c5.56-13.9,3.55-60.79,3.55-70.52,0-9.73,2.86-34.32-12.51-56.84-25.96-38.01-107.39-29.58-116.81,14.84-6.09,18.77,9.87,47.26,32.45,32.91,54.7-34.77,44.15,75.46,55.28,85.19Z"
            />
            <path
              fill="var(--umbrella)"
              d="M365.6,823.34s-7.01-78.4-22.78-91.54c-15.77-13.14-51.24-7.88-62.19,8.76-6.57,2.63-11.82-13.58,14.45-27.16,26.28-13.58,58.69-9.63,67.01,21.9,8.32,31.53,8.32,98.98,3.5,88.03Z"
            />
          </g>
        </svg>
      </div>

      {/* ── Text content (headline + subtitle) ── */}
      <div className="relative z-10 flex flex-col items-center">{children}</div>

      {/* ── Umbrella canopy ── */}
      <div ref={canopyRef} className="relative z-10 mt-4" aria-hidden="true">
        <svg
          viewBox="0 1160 738.86 360"
          width="240"
          fill="none"
          style={{ isolation: "isolate" }}
        >
          {/* Canopy front (scalloped edge — painted first, background) */}
          <path
            fill="var(--umbrella-deep)"
            d="M738.86,1221.29s-77.77,17.94-106.77-32.53c0,0-84.39,36.24-144.53-20.71,0,0-77.92,62.12-164.91,0,0,0-52.23,66.18-146.74,18.3,0,0-42.9,38.65-110.56,19.24,0,0-15.44,39.09-59.8,31.84l121.02,118.29s170.76,11.65,178.27,14.24c7.52,2.59,155.72,5.18,172.9,5.18s106.32-11.65,120.28-19.41c13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s27.15-33.3,27-68.42Z"
          />
          <path
            fill="var(--umbrella-stripe)"
            d="M453.99,1374.84c19.39-46.45,34.34-112.82,33.57-206.79,0,0-77.92,62.12-164.91,0,0,0,4.43,92.44,25.41,204.36,33.36,1.09,78.22,2,105.93,2.43Z"
          />
          <path
            fill="var(--umbrella-stripe)"
            d="M65.35,1205.58c25.25,65.08,57.22,114.56,90.92,152.2,28.34,1.99,71.43,5.09,103.96,7.73-68.48-93.03-84.32-179.16-84.32-179.16,0,0-42.9,38.65-110.56,19.24Z"
          />
          <path
            fill="var(--umbrella-stripe)"
            d="M598.02,1355.72c13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s27.15-33.3,27-68.42c0,0-77.77,17.94-106.77-32.53,0,0-24.36,96.87-85.71,178.47,23.53-3.67,45.32-7.99,51.65-11.51Z"
          />
          {/* Canopy shadow */}
          <path
            fill="#000"
            opacity="0.15"
            style={{ mixBlendMode: "multiply" }}
            d="M5.55,1237.42l121.02,118.29s170.76,11.65,178.27,14.24c7.52,2.59,155.72,5.18,172.9,5.18s106.32-11.65,120.28-19.41c13.96-7.77,79.47-55.65,79.47-55.65l34.37-10.35s16.92-20.77,23.97-46.79c.54-11.97,1-19.68,1.39-21.24.43-.02,1.12-.06,1.63-.09,0-.01,0-.02,0-.03-.36.02-.88.04-1.62.08h0c-.1.02-.17.03-.27.05.05,0,.11,0,.19,0-19.9,11.98-73.79,54.19-171.47,8.19,0,0-77.54,42.42-193.86,8.75,0,0-108.56,33.24-180.93-8,0,0-87.1,54.92-181.7,8.64-1.97.32-1.93-.37-1.15-1.5-.83-.11-1.65-.2-2.49-.33Z"
          />

          {/* Stick lower (pole between canopy layers) */}
          <path
            fill="var(--umbrella-pole-soft)"
            d="M363.86,1037.46v430.12c0,4.71,3.36,40.64,8.07,40.64h0c4.71,0,9.05-35.93,9.05-40.64v-430.12"
          />
          <path
            fill="var(--umbrella-pole)"
            d="M363.86,1037.46v430.12c0,4.71,3.36,40.64,8.07,40.64h0c1.56,0,1.46-16.16.98-24.66-2.55-25.11-.49-12.82-.49-15.97v-430.12"
          />

          {/* Canopy back (dome — painted last, foreground) */}
          <path
            fill="var(--umbrella)"
            d="M565.68,1261.79s-77.54,84.85-193.86,17.5c0,0-108.56,66.47-180.93-16.01,0,0-86.42,68.08-185.35-25.86,11.96,133.55,171.36,239.29,366.28,239.29s367.03-114.36,367.03-255.43c0,0-25.85,96.56-173.18,40.5Z"
          />
          <path
            fill="var(--umbrella-stripe-soft)"
            d="M371.83,1476.72c173.99-1.74,193.86-214.93,193.86-214.93,0,0-77.54,84.85-193.86,17.5,0,0,10.34,119.3,0,197.43Z"
          />
          <path
            fill="var(--umbrella-stripe-soft)"
            d="M5.55,1237.42c11.78,131.47,166.43,235.99,357.19,239.22-34.79-1.71-158.32-21.37-171.85-213.36,0,0-86.42,68.08-185.35-25.86Z"
          />
          {/* Decorative bands */}
          <path
            fill="#fff"
            opacity="0.1"
            d="M370.95,1371.07c-92.71,0-179.71,12.13-254.95,33.34,66.1,44.74,156.33,72.3,255.82,72.3s189.25-27.42,255.32-71.95c-75.52-21.44-162.97-33.7-256.19-33.7Z"
          />
          <path
            fill="#fff"
            opacity="0.1"
            d="M371.22,1440.46c-56.97,0-109.57,4.9-152.06,13.17,46.49,14.82,98.19,23.09,152.67,23.09s105.84-8.21,152.21-22.94c-42.62-8.36-95.51-13.32-152.82-13.32Z"
          />
        </svg>
      </div>
    </div>
  );
}
