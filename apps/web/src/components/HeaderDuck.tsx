import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

export interface HeaderDuckHandle {
  /** Duck enters from top-left, flapping, and lands upright */
  enter: () => void;
  /** Duck takes off toward top-right and exits */
  exit: () => void;
  /** Instantly hide (no animation) */
  hide: () => void;
  /** Instantly show (no animation) */
  show: () => void;
  /** One-shot squash & stretch bounce */
  bounce: () => void;
}

const HeaderDuck = forwardRef<HeaderDuckHandle, { className?: string }>(
  function HeaderDuck({ className }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const flapTweenRef = useRef<gsap.core.Tween | null>(null);
    const bobRef = useRef<gsap.core.Tween | null>(null);

    // Expose imperative animation API
    useImperativeHandle(ref, () => {
      function wingFront() {
        return svgRef.current?.querySelector<SVGElement>("#hd-wing-front");
      }
      function wingBack() {
        return svgRef.current?.querySelector<SVGElement>("#hd-wing-back");
      }
      function eye() {
        return svgRef.current?.querySelector<SVGElement>("#hd-eye");
      }
      function beak() {
        return svgRef.current?.querySelector<SVGElement>("#hd-beak");
      }
      function legBack() {
        return svgRef.current?.querySelector<SVGElement>("#hd-leg-back");
      }
      function legFront() {
        return svgRef.current?.querySelector<SVGElement>("#hd-leg-front");
      }
      function foot() {
        return svgRef.current?.querySelector<SVGElement>("#hd-foot");
      }
      function body() {
        return svgRef.current?.querySelector<SVGElement>("#hd-body");
      }

      function startFlap() {
        stopFlap();
        const wf = wingFront();
        const wb = wingBack();
        if (!wf || !wb) return;
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(
          wf,
          {
            rotation: -20,
            duration: 0.09,
            ease: "sine.inOut",
            transformOrigin: "73% 68%",
          },
          0,
        );
        tl.to(
          wb,
          {
            rotation: 20,
            duration: 0.09,
            ease: "sine.inOut",
            transformOrigin: "73% 70%",
          },
          0,
        );
        flapTweenRef.current = tl as unknown as gsap.core.Tween;
      }

      function stopFlap() {
        flapTweenRef.current?.kill();
        flapTweenRef.current = null;
        const wf = wingFront();
        const wb = wingBack();
        if (wf)
          gsap.to(wf, {
            rotation: 0,
            duration: 0.15,
            transformOrigin: "73% 68%",
          });
        if (wb)
          gsap.to(wb, {
            rotation: 0,
            duration: 0.15,
            transformOrigin: "73% 70%",
          });
      }

      return {
        enter() {
          const el = wrapRef.current;
          if (!el) return;
          const lb = legBack();
          const lf = legFront();
          const f = foot();
          startFlap();
          const tl = gsap.timeline({
            onComplete: () => {
              stopFlap();
              // Idle eye blink
              const e = eye();
              if (e) {
                gsap
                  .timeline({ repeat: -1, repeatDelay: 3.5 })
                  .to(e, {
                    scaleY: 0.1,
                    duration: 0.08,
                    transformOrigin: "50% 50%",
                  })
                  .to(e, {
                    scaleY: 1,
                    duration: 0.1,
                    transformOrigin: "50% 50%",
                  });
              }
            },
          });
          // Just above final position, slight tilt — barely off-screen
          tl.set(el, {
            x: 0,
            y: -10,
            opacity: 0,
            pointerEvents: "auto",
            rotation: 15,
          });
          if (lb) tl.set(lb, { scaleY: 0, transformOrigin: "50% 0%" });
          if (lf) tl.set(lf, { scaleY: 0, transformOrigin: "50% 0%" });
          if (f) tl.set(f, { opacity: 0 });
          // Drop in
          tl.to(el, {
            y: -2,
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
          });
          // Straighten
          tl.to(el, { rotation: 0, duration: 0.12, ease: "power2.out" }, 0.06);
          // Legs pop out
          if (lb)
            tl.to(
              lb,
              {
                scaleY: 1,
                duration: 0.1,
                ease: "power2.out",
                transformOrigin: "50% 0%",
              },
              0.12,
            );
          if (lf)
            tl.to(
              lf,
              {
                scaleY: 1,
                duration: 0.1,
                ease: "power2.out",
                transformOrigin: "50% 0%",
              },
              0.13,
            );
          if (f) tl.to(f, { opacity: 1, duration: 0.06 }, 0.18);
          // Touchdown bounce
          tl.to(el, { y: 2, duration: 0.06, ease: "power2.in" }, 0.18);
          tl.to(el, { y: 0, duration: 0.12, ease: "bounce.out" }, 0.24);
        },

        exit() {
          // Stop any bounce; CSS transition on .header-logo handles the fade
          bobRef.current?.kill();
          bobRef.current = null;
          const bd = body();
          if (bd) gsap.set(bd, { y: 0, scaleX: 1, scaleY: 1 });
        },

        bounce() {
          bobRef.current?.kill();
          bobRef.current = null;
          const bd = body();
          if (!bd) return;
          const tl = gsap.timeline();
          // Squash down
          tl.to(bd, {
            y: 3,
            scaleY: 0.92,
            scaleX: 1.06,
            duration: 0.15,
            ease: "power2.in",
            transformOrigin: "50% 100%",
          });
          // Spring up
          tl.to(bd, {
            y: -8,
            scaleY: 1.06,
            scaleX: 0.95,
            duration: 0.2,
            ease: "power2.out",
            transformOrigin: "50% 100%",
          });
          // Settle back
          tl.to(bd, {
            y: 0,
            scaleY: 1,
            scaleX: 1,
            duration: 0.25,
            ease: "bounce.out",
            transformOrigin: "50% 100%",
          });
          bobRef.current = tl as unknown as gsap.core.Tween;
        },

        hide() {
          const el = wrapRef.current;
          if (!el) return;
          gsap.set(el, { opacity: 0, pointerEvents: "none" });
        },

        show() {
          const el = wrapRef.current;
          if (!el) return;
          gsap.set(el, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            pointerEvents: "auto",
          });
        },
      };
    });

    // Cleanup on unmount
    useEffect(
      () => () => {
        flapTweenRef.current?.kill();
        bobRef.current?.kill();
      },
      [],
    );

    return (
      <div
        ref={wrapRef}
        className={className}
        style={{ display: "inline-block" }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 576 576"
          width={32}
          height={32}
          fill="none"
          role="img"
          aria-label="Duck"
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <clipPath id="hd-clip-foot">
              <path d="M234,549c0-18,9-27,27-27,27,0,126,0,126,0,18,0,27,9,27,27s-9,27-27,27h-126c-18,0-27-9-27-27Z" />
            </clipPath>
            <clipPath id="hd-clip-beak">
              <rect
                x="477"
                y="54"
                width="54"
                height="108"
                rx="27"
                ry="27"
                transform="translate(612 -396) rotate(90)"
              />
            </clipPath>
          </defs>

          {/* Back leg */}
          <g id="hd-leg-back">
            <path
              fill="var(--duck-body-dark)"
              d="M315,423h27c0,36.44,0,61.7,0,99h-27c0-36.79,0-62.05,0-99Z"
            />
          </g>

          {/* Front leg */}
          <g id="hd-leg-front">
            <path
              fill="var(--duck-body)"
              d="M270,423h54c0,36.44,0,61.7,0,99h-54c0-36.79,0-62.05,0-99Z"
            />
          </g>

          {/* Foot */}
          <g id="hd-foot">
            <path
              fill="var(--duck-feet)"
              d="M234,549c0-18,9-27,27-27,27,0,126,0,126,0,18,0,27,9,27,27s-9,27-27,27h-126c-18,0-27-9-27-27Z"
            />
            <g clipPath="url(#hd-clip-foot)">
              <rect
                fill="var(--duck-highlight)"
                opacity={0.12}
                x="288"
                y="522"
                width="126"
                height="27"
                rx="13.5"
                ry="13.5"
              />
            </g>
          </g>

          <g id="hd-body">
            {/* Back wing */}
            <g id="hd-wing-back">
              <path
                fill="var(--duck-body-dark)"
                d="M237.48,402.54c37.27-2.2,189.02-2.29,185.52-113.96-2.25-71.87-84.34-105.32-192.29-101.93-132.7,4.16-211.32,150.7-209.06,222.66.18,7.4-.06,0,71.91-2.25,35.98-1.13,143.93-4.51,143.93-4.51Z"
              />
            </g>

            {/* Body */}
            <path
              fill="var(--duck-body)"
              d="M18,288c0-39.93,36-108,216-108,108,0,108-24.71,108-108C342,18,378,0,414,0s72,18,72,72v72c0,72.67,18,72,18,144,0,108.67-126,144-180,144-90,0-162,0-162-45,0-27,0-36,0-63,0-23.85-36-36-72-36-72,0-72,9-72,0Z"
            />

            {/* Body highlight */}
            <path
              fill="var(--duck-highlight)"
              opacity={0.06}
              d="M472.22,349.36c-2-1.36-2.55-4.05-1.27-6.11,9.99-16.12,15.05-34.46,15.05-54.59,0-33.71-4.1-50.18-8.44-67.61-4.7-18.9-9.56-38.43-9.56-77.06v-67.5c0-2.48,2.01-4.5,4.5-4.5h0c2.48,0,4.5,2.01,4.5,4.5v67.5c0,37.52,4.73,56.52,9.3,74.89,4.48,17.98,8.7,34.97,8.7,69.79,0,21.85-5.52,41.8-16.42,59.37-1.35,2.17-4.24,2.76-6.35,1.33h0Z"
            />

            {/* Front wing */}
            <g id="hd-wing-front">
              <path
                fill="var(--duck-body-soft)"
                d="M234,396c37.32-1.03,189,3.73,189-108,0-71.91-81-108-189-108-132.76,0-216,144-216,216-.05,7.4,0,0,72,0h144Z"
              />
              <g opacity={0.06}>
                <path
                  fill="var(--duck-highlight)"
                  d="M148.61,212.17c27.02-14.93,55.75-22.5,85.4-22.5,53.72,0,98.94,8.97,130.77,25.93,32.67,17.41,49.23,41.97,49.23,72.98,0,41.21-289.36-63.17-265.4-76.41Z"
                />
              </g>
            </g>

            {/* Beak */}
            <g id="hd-beak">
              <rect
                fill="var(--duck-beak)"
                x="477"
                y="54"
                width="54"
                height="108"
                rx="27"
                ry="27"
                transform="translate(612 -396) rotate(90)"
              />
              <g clipPath="url(#hd-clip-beak)">
                <path
                  fill="var(--duck-highlight)"
                  opacity={0.12}
                  d="M558,108h-58.5c-7.46,0-13.5-6.04-13.5-13.5h0c0-7.46,6.04-13.5,13.5-13.5h58.5s0,27,0,27Z"
                />
              </g>
            </g>

            {/* Eye */}
            <path
              id="hd-eye"
              fill="var(--duck-eye)"
              d="M396,54h0c0-14.81,12.19-27,27-27s27,12.19,27,27c0,9.63-5.16,18.57-13.5,23.38h0c-8.35-14.47-23.79-23.38-40.5-23.38Z"
            />
          </g>

          {/* Leg highlight */}
          <g opacity={0.06}>
            <path
              fill="var(--duck-highlight)"
              d="M315,522v-103.5c0-2.49,2.01-4.5,4.5-4.5h0c2.49,0,4.5,2.01,4.5,4.5v103.5s-9,0-9,0Z"
            />
          </g>
        </svg>
      </div>
    );
  },
);

export default HeaderDuck;
