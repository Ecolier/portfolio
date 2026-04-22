import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import DuckLightSvg from "../../assets/duck_light.svg?react";
import DuckDarkSvg from "../../assets/duck_dark.svg?react";

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
    const flapTweenRef = useRef<gsap.core.Tween | null>(null);
    const idleTweenRef = useRef<gsap.core.Tween | null>(null);
    const bobRef = useRef<gsap.core.Tween | null>(null);
    // Keep first client render aligned with SSR (light) to avoid hydration mismatch.
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
      function syncTheme() {
        setIsDark(document.documentElement.classList.contains("dark"));
      }

      syncTheme();
      const observer = new MutationObserver(syncTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    // Expose imperative animation API
    useImperativeHandle(ref, () => {
      function svgPart(...ids: string[]) {
        const svg = wrapRef.current?.querySelector<SVGSVGElement>("svg");
        if (!svg) return null;
        return svg.querySelector<SVGElement>(
          ids.map((id) => `#${id}`).join(", "),
        );
      }

      function wingFront() {
        return svgPart("wing-front", "duck-wing-front", "wing");
      }

      function wingBack() {
        return svgPart("wing-back", "duck-wing-back");
      }

      function eye() {
        return svgPart("eye", "duck-eye");
      }

      function beak() {
        return svgPart("beak", "duck-beak");
      }

      function legBack() {
        return svgPart("leg-back", "pillar-back");
      }

      function legFront() {
        return svgPart("leg-front", "pillar-front");
      }

      function foot() {
        return svgPart("foot", "duck-foot", "foot-front");
      }

      function body() {
        return svgPart("body", "duck-body");
      }

      function stopIdle() {
        idleTweenRef.current?.kill();
        idleTweenRef.current = null;
      }

      function startIdle() {
        stopIdle();
        const e = eye();
        const b = beak();
        if (!e && !b) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 3.3 });
        if (e) {
          tl.to(e, {
            scaleY: 0.1,
            duration: 0.08,
            transformOrigin: "50% 50%",
          }).to(e, {
            scaleY: 1,
            duration: 0.1,
            transformOrigin: "50% 50%",
          });
        }
        if (b) {
          tl.to(
            b,
            {
              rotation: 4,
              duration: 0.14,
              ease: "power2.out",
              transformOrigin: "50% 0%",
            },
            0,
          ).to(
            b,
            {
              rotation: 0,
              duration: 0.2,
              ease: "power2.inOut",
              transformOrigin: "50% 0%",
            },
            0.14,
          );
        }
        idleTweenRef.current = tl as unknown as gsap.core.Tween;
      }

      function stopFlap() {
        flapTweenRef.current?.kill();
        flapTweenRef.current = null;

        const wf = wingFront();
        const wb = wingBack();
        if (wf) {
          gsap.to(wf, {
            rotation: 0,
            duration: 0.15,
            transformOrigin: "73% 68%",
          });
        }
        if (wb) {
          gsap.to(wb, {
            rotation: 0,
            duration: 0.15,
            transformOrigin: "73% 70%",
          });
        }
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
            rotation: -18,
            duration: 0.09,
            ease: "sine.inOut",
            transformOrigin: "73% 68%",
          },
          0,
        );
        tl.to(
          wb,
          {
            rotation: 18,
            duration: 0.09,
            ease: "sine.inOut",
            transformOrigin: "73% 70%",
          },
          0,
        );

        flapTweenRef.current = tl as unknown as gsap.core.Tween;
      }

      return {
        enter() {
          const el = wrapRef.current;
          if (!el) return;
          const lb = legBack();
          const lf = legFront();
          const f = foot();

          stopIdle();
          startFlap();

          const tl = gsap.timeline({
            onComplete: () => {
              stopFlap();
              startIdle();
            },
          });

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

          tl.to(el, {
            y: -2,
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
          });
          tl.to(el, { rotation: 0, duration: 0.12, ease: "power2.out" }, 0.06);

          if (lb) {
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
          }
          if (lf) {
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
          }
          if (f) tl.to(f, { opacity: 1, duration: 0.06 }, 0.18);

          tl.to(el, { y: 2, duration: 0.06, ease: "power2.in" }, 0.18);
          tl.to(el, { y: 0, duration: 0.12, ease: "bounce.out" }, 0.24);
        },

        exit() {
          // CSS transition on .header-logo handles fade/slide; reset local tween state
          stopFlap();
          stopIdle();
          bobRef.current?.kill();
          bobRef.current = null;
          const el = wrapRef.current;
          if (el) gsap.set(el, { y: 0, scale: 1, rotation: 0 });
          const bd = body();
          if (bd) gsap.set(bd, { y: 0, scaleX: 1, scaleY: 1 });
        },

        bounce() {
          bobRef.current?.kill();
          bobRef.current = null;
          const el = wrapRef.current;
          if (!el) return;
          const tl = gsap.timeline();
          // Squash down
          tl.to(el, {
            y: 2,
            scaleY: 0.93,
            scaleX: 1.05,
            duration: 0.15,
            ease: "power2.in",
            transformOrigin: "50% 100%",
          });
          // Spring up
          tl.to(el, {
            y: -6,
            scaleY: 1.06,
            scaleX: 0.95,
            duration: 0.2,
            ease: "power2.out",
            transformOrigin: "50% 100%",
          });
          // Settle back
          tl.to(el, {
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
          stopFlap();
          stopIdle();
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
        idleTweenRef.current?.kill();
        bobRef.current?.kill();
      },
      [],
    );

    return (
      <div
        ref={wrapRef}
        className={className}
        style={{ display: "inline-flex", width: 32, height: 32 }}
      >
        {isDark ? (
          <DuckDarkSvg
            className="block h-full w-full"
            role="img"
            aria-label="Duck"
            style={{ overflow: "visible" }}
          />
        ) : (
          <DuckLightSvg
            className="block h-full w-full"
            role="img"
            aria-label="Duck"
            style={{ overflow: "visible" }}
          />
        )}
      </div>
    );
  },
);

export default HeaderDuck;
