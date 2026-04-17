import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TIME_ORIGIN = typeof performance !== "undefined" ? performance.now() : 0;

// Duotone palettes: background + line color
const PALETTES = {
  light: {
    bg: new THREE.Color(0.91, 0.929, 0.953),
    line: new THREE.Color(0.118, 0.176, 0.239),
  },
  dark: {
    bg: new THREE.Color(0.043, 0.067, 0.094),
    line: new THREE.Color(0.816, 0.863, 0.902),
  },
};

function getResolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Shared ref so the transition system can access the shader material
export const shaderMaterialRef = {
  current: null as THREE.ShaderMaterial | null,
};

// Module-level state: obstacle rectangles in UV coords (0-1, bottom-left origin)
export const windState = {
  obstacles: [] as Array<{ x: number; y: number; w: number; h: number }>,
};

// Keep fluidState export for backward compat (about, project detail pages)
// Writes to it are harmless no-ops — the wind shader ignores these values
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

  const uniforms = useMemo(() => {
    const initial = PALETTES[getResolvedTheme()];
    return {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_bgColor: { value: initial.bg.clone() },
      u_lineColor: { value: initial.line.clone() },
      u_obs1: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs2: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs3: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs4: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obsCount: { value: 0 },
      u_transition: { value: 0.0 },
      u_transitionPhase: { value: 0.0 },
      u_scrollY: { value: 0.0 },
    };
  }, []);

  // Theme observer
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

  // Scroll listener
  useEffect(() => {
    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(({ gl }, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    const elapsed = (performance.now() - TIME_ORIGIN) / 1000;

    u.u_time.value = elapsed;
    u.u_res.value.set(gl.domElement.width, gl.domElement.height);
    u.u_scrollY.value = scrollRef.current;

    // Lerp colors toward target palette
    const lf = 1 - Math.exp(-6 * delta);
    u.u_bgColor.value.lerp(targetPalette.current.bg, lf);
    u.u_lineColor.value.lerp(targetPalette.current.line, lf);

    // Sync obstacle uniforms from windState
    const obs = windState.obstacles;
    u.u_obsCount.value = Math.min(obs.length, 4);
    const targets = [u.u_obs1, u.u_obs2, u.u_obs3, u.u_obs4];
    for (let i = 0; i < 4; i++) {
      if (i < obs.length) {
        targets[i].value.set(obs[i].x, obs[i].y, obs[i].w, obs[i].h);
      } else {
        targets[i].value.set(0, 0, 0, 0);
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
          precision highp float;

          uniform float u_time;
          uniform vec2  u_res;
          uniform vec3  u_bgColor;
          uniform vec3  u_lineColor;
          uniform vec4  u_obs1;
          uniform vec4  u_obs2;
          uniform vec4  u_obs3;
          uniform vec4  u_obs4;
          uniform int   u_obsCount;
          uniform float u_transition;
          uniform float u_scrollY;

          float hash(float n) { return fract(sin(n * 127.1) * 43758.5453123); }
          float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

          vec4 getObs(int i) {
            if (i == 0) return u_obs1;
            if (i == 1) return u_obs2;
            if (i == 2) return u_obs3;
            return u_obs4;
          }

          void main() {
            vec2  uv     = gl_FragCoord.xy / u_res;
            float aspect = u_res.x / u_res.y;
            vec2  p      = vec2(uv.x * aspect, uv.y);
            float px     = 1.0 / u_res.y;
            float thick  = px * 1.5;

            float a = 0.0;

            if (u_obsCount > 0) {
              // Combined bounding box of all obstacles
              float cL = 1e5, cR = -1e5, cB = 1e5, cT = -1e5;
              for (int i = 0; i < 4; i++) {
                if (i >= u_obsCount) break;
                vec4 ob = getObs(i);
                vec2 oc = vec2(ob.x * aspect, ob.y);
                vec2 hs = vec2(ob.z * aspect, ob.w);
                cL = min(cL, oc.x - hs.x);
                cR = max(cR, oc.x + hs.x);
                cB = min(cB, oc.y - hs.y);
                cT = max(cT, oc.y + hs.y);
              }

              // Shrink obstacle bounds inward — tolerance zone lets particles
              // overlap the text edges slightly, making corridors wider
              float tol = 0.06;
              cL += tol;
              cR -= tol;
              cB += tol * 0.5;
              cT -= tol * 0.5;
              // Ensure obstacle still has positive size
              if (cL >= cR) { cL = (cL + cR) * 0.5 - 0.01; cR = cL + 0.02; }

              float leftW  = max(cL, 0.001);
              float rightW = max(aspect - cR, 0.001);
              float obsCX  = (cL + cR) * 0.5;

              // Source tube centered under obstacle
              float tubeHW = 0.18;
              float tubeCX = obsCX;

              // Particles die shortly above obstacle top
              float deathCeil = cT + 0.5;

              // Blend: 0 far below obstacle → 1 at obstacle bottom
              float bStart = max(cB - 0.35, -0.15);
              float bEnd   = cB - 0.02;
              float b      = smoothstep(bStart, bEnd, p.y);

              // Above obstacle: converge back toward center before death
              float converge = smoothstep(cT + 0.02, deathCeil - 0.02, p.y);
              b = mix(b, 0.0, converge);

              for (int layer = 0; layer < 4; layer++) {
                float lSeed = float(layer) * 1000.0;
                float lSpd  = (layer < 2) ? 0.09 : 0.16;
                float lMaxA = (layer < 2) ? 0.20 : 0.45;

                for (int g = 0; g < 2; g++) {
                  float seed = lSeed + (g == 0 ? 0.0 : 500.0);

                  // Source (tube half) and target (corridor) intervals
                  float sS, sW, tS, tW;
                  if (g == 0) { sS = tubeCX - tubeHW; sW = tubeHW; tS = 0.0; tW = leftW; }
                  else        { sS = tubeCX;           sW = tubeHW; tS = cR;  tW = rightW; }

                  // x(t,b) = (1-b)*(sS + t*sW) + b*(tS + t*tW)
                  float baseX = (1.0 - b) * sS + b * tS;
                  float scale = (1.0 - b) * sW + b * tW;
                  if (scale < px * 2.0) continue;

                  // Parameter t for this pixel
                  float t = (p.x - baseX) / scale;
                  if (t < -0.06 || t > 1.06) continue;

                  // Lane count: fill corridor at ~8px spacing
                  float numLanes = max(floor(tW / (px * 8.0)), 4.0);

                  float laneF = t * numLanes - 0.5;
                  float bLane = floor(laneF);

                  for (float di = 0.0; di <= 2.0; di += 1.0) {
                    float lane = bLane + di;
                    if (lane < 0.0 || lane >= numLanes) continue;

                    float lh = hash(lane * 127.1 + seed);
                    if (lh < 0.15) continue;

                    float laneT = (lane + 0.5) / numLanes;
                    laneT += (hash(lane * 311.7 + seed) - 0.5) * 0.5 / numLanes;

                    // Screen-space distance (constant regardless of squeeze)
                    float sDist = (t - laneT) * scale;
                    if (abs(sDist) > thick * 3.0) continue;

                    // Lifecycle
                    float birthY = -0.08 - lh * 0.12;
                    float spd    = lSpd + hash(lane * 41.3 + seed) * 0.03;
                    float span   = deathCeil - birthY;
                    float cycle  = fract(u_time * spd / span + lh);
                    float headY  = birthY + cycle * span;
                    float life   = cycle;

                    float trailLen = 0.04 + lh * 0.06;
                    trailLen *= smoothstep(0.0, 0.06, life);
                    trailLen *= smoothstep(1.0, 0.75, life);

                    float distY = headY - p.y;
                    float rad   = thick;
                    if (distY < -rad || distY > trailLen + rad) continue;

                    // Swirl near death
                    float swirlOn  = step(0.5, hash(lane * 83.9 + seed));
                    float swirlAmt = smoothstep(0.6, 1.0, life) * swirlOn;
                    float swirlDir = (hash(lane * 61.3 + seed) > 0.5) ? 1.0 : -1.0;
                    float swirl    = sin(distY * 35.0 + u_time * 2.5 + lh * 6.28)
                                   * swirlAmt * swirlDir * px * 3.0;

                    float finalDist = abs(sDist + swirl);

                    // Rounded rect SDF
                    float hw = thick;
                    float hh = trailLen * 0.5;
                    vec2 q   = vec2(finalDist, abs(distY - hh)) - vec2(hw, hh) + rad;
                    float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;

                    float lineA    = smoothstep(thick * 0.5, -thick * 0.3, sdf);
                    float tPos     = max(distY, 0.0) / max(trailLen, 0.001);
                    float tailFade = 1.0 - tPos * tPos;

                    float lifeA = smoothstep(1.0, 0.78, life);
                    lifeA *= smoothstep(-0.01, 0.02, headY - trailLen);

                    float fa = lineA * tailFade * lifeA * lMaxA * (0.5 + lh * 0.5);
                    a = max(a, fa);
                  }
                }
              }
            } else {
              // No obstacles — straight vertical lanes
              for (int layer = 0; layer < 4; layer++) {
                float seed = float(layer) * 173.0;
                float lSpd = (layer < 2) ? 0.09 : 0.16;
                float lMaxA = (layer < 2) ? 0.20 : 0.45;
                float laneW  = px * 8.0;
                float laneIdx = floor(p.x / laneW);

                for (float di = -1.0; di <= 1.0; di += 1.0) {
                  float lane = laneIdx + di;
                  float lh   = hash(lane * 127.1 + seed);
                  if (lh < 0.15) continue;

                  float laneX = (lane + 0.5) * laneW;
                  laneX += (hash(lane * 311.7 + seed) - 0.5) * laneW * 0.6;

                  float signedD = p.x - laneX;
                  if (abs(signedD) > thick * 2.0) continue;

                  float birthY = -0.10 - lh * 0.20;
                  float deathY = 1.0 + lh * 0.30;
                  float span   = deathY - birthY;
                  float spd    = lSpd + lh * 0.03;
                  float cycle  = fract(u_time * spd / span + lh);
                  float headY  = birthY + cycle * span;
                  float life   = cycle;

                  float trailLen = 0.05 + lh * 0.08;
                  trailLen *= smoothstep(0.0, 0.08, life);
                  trailLen *= smoothstep(1.0, 0.65, life);

                  float distY = headY - p.y;
                  float rad = thick;
                  if (distY < -rad || distY > trailLen + rad) continue;

                  float swirlOn    = step(0.45, hash(lane * 83.9 + seed));
                  float swirlPhase = smoothstep(0.55, 1.0, life) * swirlOn;
                  float swirlDir   = (hash(lane * 61.3 + seed) > 0.5) ? 1.0 : -1.0;
                  float swirl      = sin(distY * 35.0 + u_time * 2.5 + lh * 6.28)
                                   * swirlPhase * swirlDir * px * 3.0;

                  float finalDist = abs(signedD + swirl);

                  float hw = thick;
                  float hh = trailLen * 0.5;
                  vec2 q = vec2(finalDist, abs(distY - hh)) - vec2(hw, hh) + rad;
                  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;

                  float lineA    = smoothstep(thick * 0.5, -thick * 0.3, sdf);
                  float tPos     = max(distY, 0.0) / max(trailLen, 0.001);
                  float tailFade = 1.0 - tPos * tPos;

                  float lifeA = smoothstep(1.0, 0.70, life);
                  lifeA *= smoothstep(-0.02, 0.03, headY - trailLen);

                  float fa = lineA * tailFade * lifeA * lMaxA * (0.5 + lh * 0.5);
                  a = max(a, fa);
                }
              }
            }

            // Page transition: flood screen with line color
            a = mix(a, 1.0, u_transition);

            vec3 col = mix(u_bgColor, u_lineColor, a);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
