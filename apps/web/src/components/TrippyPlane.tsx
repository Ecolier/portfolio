import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TIME_ORIGIN = typeof performance !== "undefined" ? performance.now() : 0;

const PALETTES = {
  light: {
    a: new THREE.Color(0.85, 0.88, 0.93),
    b: new THREE.Color(0.9, 0.93, 0.96),
    c: new THREE.Color(0.94, 0.96, 0.98),
  },
  dark: {
    a: new THREE.Color(0.12, 0.16, 0.22),
    b: new THREE.Color(0.08, 0.12, 0.18),
    c: new THREE.Color(0.05, 0.08, 0.12),
  },
};

function mod289(x: number) {
  return x - Math.floor(x / 289) * 289;
}
function permute(x: number) {
  return mod289((34 * x + 1) * x);
}
function snoise2d(x: number, y: number): number {
  const F2 = 0.3660254037844386; // 0.5 * (Math.sqrt(3) - 1)
  const G2 = 0.21132486540518713; // (3 - Math.sqrt(3)) / 6
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - i + t;
  const y0 = y - j + t;
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = mod289(i);
  const jj = mod289(j);
  const gi0 = permute(permute(jj) + ii);
  const gi1 = permute(permute(jj + j1) + ii + i1);
  const gi2 = permute(permute(jj + 1) + ii + 1);
  const gx0 = 2 * ((gi0 / 41) % 1) - 1;
  const gy0 = Math.abs(gx0) - 0.5;
  const gx0c = gx0 - Math.floor(gx0 + 0.5);
  const gx1 = 2 * ((gi1 / 41) % 1) - 1;
  const gy1 = Math.abs(gx1) - 0.5;
  const gx1c = gx1 - Math.floor(gx1 + 0.5);
  const gx2 = 2 * ((gi2 / 41) % 1) - 1;
  const gy2 = Math.abs(gx2) - 0.5;
  const gx2c = gx2 - Math.floor(gx2 + 0.5);
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  let n0 = t0 < 0 ? 0 : ((t0 *= t0), t0 * t0 * (gx0c * x0 + gy0 * y0));
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  let n1 = t1 < 0 ? 0 : ((t1 *= t1), t1 * t1 * (gx1c * x1 + gy1 * y1));
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  let n2 = t2 < 0 ? 0 : ((t2 *= t2), t2 * t2 * (gx2c * x2 + gy2 * y2));
  return 130 * (n0 + n1 + n2);
}

function getResolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Shared ref so the transition system can access the shader material
export const shaderMaterialRef = {
  current: null as THREE.ShaderMaterial | null,
};

// Reusable vector to avoid per-frame allocation
const _hoverTarget = new THREE.Vector2();

// Module-level reactive state — external code writes, useFrame reads
export const fluidState = {
  hoveredPhase: -1,
  hoveredX: 0,
  hoveredY: 0,
  targetScale: 1.0,
};

export default function TrippyPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const targetPalette = useRef(PALETTES[getResolvedTheme()]);
  const scrollRef = useRef(0);
  const hoverStrengths = useRef([0, 0, 0]);
  const hoverTargets = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  // Stable uniforms object — never recreated on re-render
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_colA: { value: PALETTES.light.a.clone() },
      u_colB: { value: PALETTES.light.b.clone() },
      u_colC: { value: PALETTES.light.c.clone() },
      u_transition: { value: 0.0 },
      u_transitionPhase: { value: 2.0 },
      u_scale: { value: 1.0 },
      u_cA1: { value: new THREE.Vector2() },
      u_cA2: { value: new THREE.Vector2() },
      u_cB1: { value: new THREE.Vector2() },
      u_cB2: { value: new THREE.Vector2() },
      u_cC1: { value: new THREE.Vector2() },
      u_cC2: { value: new THREE.Vector2() },
      u_scrollY: { value: 0.0 },
    }),
    [],
  );

  useEffect(() => {
    function updateTarget() {
      targetPalette.current = PALETTES[getResolvedTheme()];
    }

    updateTarget();

    const observer = new MutationObserver(updateTarget);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    shaderMaterialRef.current = materialRef.current;

    return () => {
      observer.disconnect();
      shaderMaterialRef.current = null;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame(({ gl }, delta) => {
    if (materialRef.current) {
      const elapsed = (performance.now() - TIME_ORIGIN) / 1000;
      const t = elapsed * 0.1;
      const gravY = -t * 0.4;

      materialRef.current.uniforms.u_time.value = elapsed;
      materialRef.current.uniforms.u_res.value.set(
        gl.domElement.width,
        gl.domElement.height,
      );

      // Smoothly lerp colors toward target palette
      const lerpFactor = 1 - Math.exp(-6 * delta);
      const u = materialRef.current.uniforms;
      const tp = targetPalette.current;
      u.u_colA.value.lerp(tp.a, lerpFactor);
      u.u_colB.value.lerp(tp.b, lerpFactor);
      u.u_colC.value.lerp(tp.c, lerpFactor);

      // Update scroll and scale
      u.u_scrollY.value = scrollRef.current;
      u.u_scale.value +=
        (fluidState.targetScale - u.u_scale.value) * (1 - Math.exp(-2 * delta));

      u.u_cA1.value.set(
        snoise2d(t * 0.12, 1.3) * 0.6,
        snoise2d(t * 0.1, 4.7) * 0.4 + gravY * 0.3,
      );
      u.u_cA2.value.set(
        snoise2d(t * 0.09, 7.1) * 0.5,
        snoise2d(t * 0.11, 2.9) * 0.35 + gravY * 0.25,
      );
      u.u_cB1.value.set(
        snoise2d(t * 0.08, 3.6) * 0.55,
        snoise2d(t * 0.07, 8.2) * 0.45 + gravY * 0.15,
      );
      u.u_cB2.value.set(
        snoise2d(t * 0.1, 5.8) * 0.5,
        snoise2d(t * 0.06, 6.4) * 0.3 + gravY * 0.1,
      );
      u.u_cC1.value.set(
        snoise2d(t * 0.11, 9.3) * 0.5,
        snoise2d(t * 0.09, 0.7) * 0.4 + gravY * 0.2,
      );
      u.u_cC2.value.set(
        snoise2d(t * 0.07, 2.1) * 0.6,
        snoise2d(t * 0.12, 5.1) * 0.35 + gravY * 0.22,
      );

      // Hover-driven phase affinity: per-phase strengths fade independently
      const activePhase =
        fluidState.hoveredPhase >= 0 ? fluidState.hoveredPhase % 3 : -1;
      const posLerp = 1 - Math.exp(-6 * delta);
      const fadeIn = 1 - Math.exp(-4 * delta);
      const fadeOut = 1 - Math.exp(-3 * delta);

      for (let i = 0; i < 3; i++) {
        const isActive = i === activePhase;
        const goal = isActive ? 1 : 0;
        const rate = isActive ? fadeIn : fadeOut;
        hoverStrengths.current[i] += (goal - hoverStrengths.current[i]) * rate;

        if (isActive) {
          hoverTargets.current[i].x +=
            (fluidState.hoveredX - hoverTargets.current[i].x) * posLerp;
          hoverTargets.current[i].y +=
            (fluidState.hoveredY - hoverTargets.current[i].y) * posLerp;
        }

        if (hoverStrengths.current[i] > 0.01) {
          _hoverTarget.set(
            hoverTargets.current[i].x,
            hoverTargets.current[i].y,
          );
          const strength = hoverStrengths.current[i] * 0.4;
          if (i === 0) u.u_cA1.value.lerp(_hoverTarget, strength);
          else if (i === 1) u.u_cB1.value.lerp(_hoverTarget, strength);
          else u.u_cC1.value.lerp(_hoverTarget, strength);
        }
      }
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          void main() {
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={`
          uniform float u_time;
          uniform vec2 u_res;
          uniform vec3 u_colA;
          uniform vec3 u_colB;
          uniform vec3 u_colC;
          uniform float u_transition;
          uniform float u_transitionPhase;
          uniform float u_scale;
          uniform vec2 u_cA1;
          uniform vec2 u_cA2;
          uniform vec2 u_cB1;
          uniform vec2 u_cB2;
          uniform vec2 u_cC1;
          uniform vec2 u_cC2;
          uniform float u_scrollY;

          // — simplex 2D noise (Ashima Arts) —
          vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

          float snoise(vec2 v) {
            const vec4 C = vec4(
              0.211324865405187,   // (3.0-sqrt(3.0))/6.0
              0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
             -0.577350269189626,   // -1.0 + 2.0 * C.x
              0.024390243902439    // 1.0/41.0
            );
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                           + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                     dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          // fractional Brownian motion
          float fbm(vec2 p, float t, float speed) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5)); // rotate to reduce axial bias
            for (int i = 0; i < 3; i++) {
              v += a * snoise(p + t * speed);
              p = rot * p * 2.0 + shift;
              a *= 0.5;
            }
            return v;
          }

          // smooth blend between phases
          float phaseField(float n, float sharpness) {
            return smoothstep(-sharpness, sharpness, n);
          }

          void main() {
            float s = u_scale;
            vec2 uv = gl_FragCoord.xy / u_res;
            float aspect = u_res.x / u_res.y;
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            float t = u_time * 0.10;

            // — gravity bias with scroll-driven lateral drift —
            vec2 gravity = vec2(u_scrollY * 0.12, -t * 0.1);

            // — base flow field shared by all phases —
            float flow_x = snoise(p * vec2(1.2, 2.5) * s + vec2(t * 0.08, -t * 0.3)) * 0.3;
            float flow_y = snoise(p * vec2(1.5, 2.0) * s + vec2(-t * 0.06, -t * 0.25)) * 0.3;
            vec2 flow = vec2(flow_x, flow_y);

            // — bubble centers from uniforms (computed on CPU) —
            float rA = min(length(p - u_cA1), length(p - u_cA2));
            float rB = min(length(p - u_cB1), length(p - u_cB2));
            float rC = min(length(p - u_cC1), length(p - u_cC2));

            float blobA = smoothstep(0.65 / s, 0.0, rA);
            float blobB = smoothstep(0.55 / s, 0.0, rB);
            float blobC = smoothstep(0.60 / s, 0.0, rC);

            // — phase positions with flow and gravity —
            vec2 pA = p + flow + gravity * 1.2;
            vec2 pB = p + flow + gravity * 0.6;
            vec2 pC = p + flow + gravity * 0.9;

            // — mutual displacement: phases push each other —
            vec2 pushA = vec2(
              snoise(pB * 2.0 * s + vec2(3.1, 7.4)) * 0.15,
              snoise(pC * 2.0 * s + vec2(6.2, 1.8)) * 0.15
            );
            vec2 pushB = vec2(
              snoise(pA * 2.0 * s + vec2(9.3, 2.6)) * 0.15,
              snoise(pC * 1.8 * s + vec2(4.7, 8.1)) * 0.15
            );
            vec2 pushC = vec2(
              snoise(pA * 1.8 * s + vec2(2.9, 5.3)) * 0.15,
              snoise(pB * 1.8 * s + vec2(7.6, 3.4)) * 0.15
            );

            // — phase fields with mutual influence (single pass) —
            float nA = blobA + 0.4 * fbm((pA + pushA) * 2.0 * s + vec2(1.7, 9.2), t, 0.25);
            nA += 0.15 * snoise((pA + pushA) * vec2(3.0, 4.5) * s + vec2(t * 0.2, -t * 0.5));

            float nB = blobB + 0.4 * fbm((pB + pushB) * 1.5 * s + vec2(5.3, 2.8), t, 0.15);
            nB += 0.12 * snoise((pB + pushB) * vec2(2.0, 3.0) * s + vec2(-t * 0.1, -t * 0.3));

            float nC = blobC + 0.4 * fbm((pC + pushC) * 1.8 * s + vec2(8.1, 4.6), t, 0.20);
            nC += 0.13 * snoise((pC + pushC) * vec2(2.5, 3.8) * s + vec2(t * 0.15, -t * 0.4));

            // — winner-takes-all: opaque paint, no blending —
            vec3 cA = u_colA;
            vec3 cB = u_colB;
            vec3 cC = u_colC;

            // — boost the selected phase by transition amount —
            float boost = u_transition * 3.0;
            float tA = nA + (u_transitionPhase < 0.5 ? boost : 0.0);
            float tB = nB + (u_transitionPhase > 0.5 && u_transitionPhase < 1.5 ? boost : 0.0);
            float tC = nC + (u_transitionPhase > 1.5 ? boost : 0.0);

            // — hard selection: highest field value owns the pixel —
            vec3 col = cC;
            float maxN = tC;
            if (tA > maxN) { col = cA; maxN = tA; }
            if (tB > maxN) { col = cB; maxN = tB; }

            // — subtle contour at phase boundaries —
            float sortedMax = max(tA, max(tB, tC));
            float sortedMin = min(tA, min(tB, tC));
            float sortedMid = (tA + tB + tC) - sortedMax - sortedMin;
            float edgeDist = sortedMax - sortedMid;
            float contour = 1.0 - smoothstep(0.0, 0.1, edgeDist);
            col *= 1.0 - contour * 0.12;

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
