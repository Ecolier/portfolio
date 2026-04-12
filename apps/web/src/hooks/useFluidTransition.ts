import { useCallback, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { shaderMaterialRef } from "#/components/TrippyPlane";

const TRANSITION_DURATION = 600; // ms for the fluid to flood the screen

export function useFluidTransition() {
  const router = useRouter();
  const animating = useRef(false);

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (animating.current) return;
      animating.current = true;

      const mat = shaderMaterialRef.current;
      if (!mat) {
        // fallback: navigate immediately if shader isn't ready
        router.navigate({ to });
        animating.current = false;
        return;
      }

      const start = performance.now();
      const uniforms = mat.uniforms;

      // Phase 1: animate transition 0 → 1 (white floods screen)
      function animateIn(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        // ease-in-out cubic
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        uniforms.u_transition.value = eased;

        if (progress < 1) {
          requestAnimationFrame(animateIn);
        } else {
          // Screen is fully white — navigate now
          router.navigate({ to }).then(() => {
            // Phase 2: animate transition 1 → 0 (reveal new page)
            const start2 = performance.now();
            function animateOut(now2: number) {
              const elapsed2 = now2 - start2;
              const progress2 = Math.min(elapsed2 / TRANSITION_DURATION, 1);
              const eased2 =
                progress2 < 0.5
                  ? 4 * progress2 * progress2 * progress2
                  : 1 - Math.pow(-2 * progress2 + 2, 3) / 2;

              uniforms.u_transition.value = 1 - eased2;

              if (progress2 < 1) {
                requestAnimationFrame(animateOut);
              } else {
                uniforms.u_transition.value = 0;
                animating.current = false;
              }
            }
            requestAnimationFrame(animateOut);
          });
        }
      }

      requestAnimationFrame(animateIn);
    },
    [router],
  );

  return navigateWithTransition;
}
