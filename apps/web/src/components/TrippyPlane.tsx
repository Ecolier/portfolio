import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PALETTES = {
  light: {
    a: new THREE.Color(0.988, 0.973, 0.973),
    b: new THREE.Color(0.984, 0.937, 0.937),
    c: new THREE.Color(1.0, 1.0, 1.0),
    d: new THREE.Color(0.976, 0.875, 0.875),
  },
  dark: {
    a: new THREE.Color(0.12, 0.16, 0.22),
    b: new THREE.Color(0.08, 0.12, 0.18),
    c: new THREE.Color(0.05, 0.08, 0.12),
    d: new THREE.Color(0.15, 0.1, 0.2),
  },
};

// — JS-side simplex noise for bubble center computation (runs once per frame, not per pixel) —
function mod289(x: number) {
  return x - Math.floor(x / 289) * 289;
}
function permute(x: number) {
  return mod289((34 * x + 1) * x);
}
function snoise2d(x: number, y: number): number {
  const F2 = 0.3660254037844386;
  const G2 = 0.21132486540518713;
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

export default function TrippyPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useEffect(() => {
    function applyPalette() {
      if (!materialRef.current) return;
      const p = PALETTES[getResolvedTheme()];
      materialRef.current.uniforms.u_colA.value.copy(p.a);
      materialRef.current.uniforms.u_colB.value.copy(p.b);
      materialRef.current.uniforms.u_colC.value.copy(p.c);
      materialRef.current.uniforms.u_colD.value.copy(p.d);
    }

    applyPalette();

    const observer = new MutationObserver(applyPalette);
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

  useFrame(({ clock, size }) => {
    if (materialRef.current) {
      const elapsed = clock.getElapsedTime();
      const t = elapsed * 0.1;
      const gravY = -t * 0.4;

      materialRef.current.uniforms.u_time.value = elapsed;
      materialRef.current.uniforms.u_res.value.set(size.width, size.height);

      // Compute bubble centers on CPU (same value for every pixel)
      const u = materialRef.current.uniforms;
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
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          u_time: { value: 0 },
          u_res: { value: new THREE.Vector2(1, 1) },
          u_colA: { value: PALETTES.light.a.clone() },
          u_colB: { value: PALETTES.light.b.clone() },
          u_colC: { value: PALETTES.light.c.clone() },
          u_colD: { value: PALETTES.light.d.clone() },
          u_transition: { value: 0.0 },
          u_cA1: { value: new THREE.Vector2() },
          u_cA2: { value: new THREE.Vector2() },
          u_cB1: { value: new THREE.Vector2() },
          u_cB2: { value: new THREE.Vector2() },
          u_cC1: { value: new THREE.Vector2() },
          u_cC2: { value: new THREE.Vector2() },
        }}
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
          uniform vec3 u_colD;
          uniform float u_transition;
          uniform vec2 u_cA1;
          uniform vec2 u_cA2;
          uniform vec2 u_cB1;
          uniform vec2 u_cB2;
          uniform vec2 u_cC1;
          uniform vec2 u_cC2;

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
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
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
            vec2 uv = gl_FragCoord.xy / u_res;
            float aspect = u_res.x / u_res.y;
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            float t = u_time * 0.10;

            // — gravity bias: paint sinks downward (side view of aquarium) —
            vec2 gravity = vec2(0.0, -t * 0.4);

            // — base flow field shared by all phases —
            float flow_x = snoise(p * vec2(1.2, 2.5) + vec2(t * 0.08, -t * 0.3)) * 0.3;
            float flow_y = snoise(p * vec2(1.5, 2.0) + vec2(-t * 0.06, -t * 0.25)) * 0.3;
            vec2 flow = vec2(flow_x, flow_y);

            // — bubble centers from uniforms (computed on CPU) —
            float rA = min(length(p - u_cA1), length(p - u_cA2));
            float rB = min(length(p - u_cB1), length(p - u_cB2));
            float rC = min(length(p - u_cC1), length(p - u_cC2));

            float blobA = smoothstep(0.65, 0.0, rA);
            float blobB = smoothstep(0.55, 0.0, rB);
            float blobC = smoothstep(0.60, 0.0, rC);

            // — phase positions with flow and gravity —
            vec2 pA = p + flow + gravity * 1.2;
            vec2 pB = p + flow + gravity * 0.6;
            vec2 pC = p + flow + gravity * 0.9;

            // — mutual displacement: phases push each other —
            vec2 pushA = vec2(
              snoise(pB * 2.0 + vec2(3.1, 7.4)) * 0.15,
              snoise(pC * 2.0 + vec2(6.2, 1.8)) * 0.15
            );
            vec2 pushB = vec2(
              snoise(pA * 2.0 + vec2(9.3, 2.6)) * 0.15,
              snoise(pC * 1.8 + vec2(4.7, 8.1)) * 0.15
            );
            vec2 pushC = vec2(
              snoise(pA * 1.8 + vec2(2.9, 5.3)) * 0.15,
              snoise(pB * 1.8 + vec2(7.6, 3.4)) * 0.15
            );

            // — phase fields with mutual influence (single pass) —
            float nA = blobA + 0.4 * fbm((pA + pushA) * 2.0 + vec2(1.7, 9.2), t, 0.25);
            nA += 0.15 * snoise((pA + pushA) * vec2(3.0, 4.5) + vec2(t * 0.2, -t * 0.5));

            float nB = blobB + 0.4 * fbm((pB + pushB) * 1.5 + vec2(5.3, 2.8), t, 0.15);
            nB += 0.12 * snoise((pB + pushB) * vec2(2.0, 3.0) + vec2(-t * 0.1, -t * 0.3));

            float nC = blobC + 0.4 * fbm((pC + pushC) * 1.8 + vec2(8.1, 4.6), t, 0.20);
            nC += 0.13 * snoise((pC + pushC) * vec2(2.5, 3.8) + vec2(t * 0.15, -t * 0.4));

            // — winner-takes-all: opaque paint, no blending —
            vec3 colA = u_colA;
            vec3 colB = u_colB;
            vec3 colC = u_colC;
            vec3 colD = u_colD;

            // subtle pigment variation within each paint blob
            float shimA = snoise(p * vec2(6.0, 10.0) + t * 0.3) * 0.08;
            float shimB = snoise(p * vec2(5.0, 8.0) - t * 0.2) * 0.06;
            float shimC = snoise(p * vec2(5.5, 9.0) + t * 0.25) * 0.07;

            vec3 cA = mix(colA, colD, shimA + 0.15 * sin(nA * 4.0));
            vec3 cB = mix(colB, colA, shimB + 0.10 * cos(nB * 3.0));
            vec3 cC = mix(colC, colB, shimC + 0.12 * sin(nC * 3.5));

            // — boost phase C (white) by transition amount —
            float tC = nC + u_transition * 3.0;

            // — hard selection: highest field value owns the pixel —
            vec3 col = cC;
            float maxN = tC;
            if (nA > maxN) { col = cA; maxN = nA; }
            if (nB > maxN) { col = cB; maxN = nB; }

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
