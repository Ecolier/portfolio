import { useCallback, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { shaderMaterialRef } from "@/components/TrippyPlane";

const REVEAL_DURATION = 800; // ms for the fluid to recede and reveal new page

export function useFluidTransition() {
  const router = useRouter();
  const animating = useRef(false);

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (animating.current) return;
      animating.current = true;

      const mat = shaderMaterialRef.current;
      if (!mat) {
        router.navigate({ to });
        animating.current = false;
        return;
      }

      // Instantly flood the screen
      mat.uniforms.u_transition.value = 1;

      // Navigate immediately — new content is hidden behind the flood
      router.navigate({ to });

      // Reveal: animate transition 1 → 0 so the liquid organically recedes
      const start = performance.now();
      function animateReveal(now: number) {
        const currentMat = shaderMaterialRef.current;
        if (!currentMat) {
          animating.current = false;
          return;
        }
        const elapsed = now - start;
        const progress = Math.min(elapsed / REVEAL_DURATION, 1);
        // ease-out cubic — fast start, gentle landing
        const eased = 1 - Math.pow(1 - progress, 3);

        currentMat.uniforms.u_transition.value = 1 - eased;

        if (progress < 1) {
          requestAnimationFrame(animateReveal);
        } else {
          currentMat.uniforms.u_transition.value = 0;
          animating.current = false;
        }
      }
      requestAnimationFrame(animateReveal);
    },
    [router],
  );

  return navigateWithTransition;
}
