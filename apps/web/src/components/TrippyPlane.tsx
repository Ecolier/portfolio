import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterialRef, windState } from "@/lib/canvasState";

const TIME_ORIGIN = typeof performance !== "undefined" ? performance.now() : 0;

// Duotone palettes: background + line color
const PALETTES = {
  light: {
    bg: new THREE.Color(0.91, 0.929, 0.953),
    line: new THREE.Color(0.102, 0.169, 0.251),
    particle: new THREE.Color(0.58, 0.68, 0.78),
  },
  dark: {
    bg: new THREE.Color(0.043, 0.067, 0.094),
    line: new THREE.Color(0.784, 0.855, 0.922),
    particle: new THREE.Color(0.3, 0.42, 0.55),
  },
};

function getResolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export { shaderMaterialRef, windState };

export default function TrippyPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const targetPalette = useRef(PALETTES[getResolvedTheme()]);

  const uniforms = useMemo(() => {
    const initial = PALETTES[getResolvedTheme()];
    return {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_bgColor: { value: initial.bg.clone() },
      u_lineColor: { value: initial.line.clone() },
      u_particleColor: { value: initial.particle.clone() },
      u_obs1: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs2: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs3: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obs4: { value: new THREE.Vector4(0, 0, 0, 0) },
      u_obsCount: { value: 0 },
      u_transition: { value: 0.0 },
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

  useFrame(({ gl }, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    const elapsed = (performance.now() - TIME_ORIGIN) / 1000;

    u.u_time.value = elapsed;
    u.u_res.value.set(gl.domElement.width, gl.domElement.height);

    // Lerp colors toward target palette
    const lf = 1 - Math.exp(-6 * delta);
    u.u_bgColor.value.lerp(targetPalette.current.bg, lf);
    u.u_lineColor.value.lerp(targetPalette.current.line, lf);
    u.u_particleColor.value.lerp(targetPalette.current.particle, lf);

    // Snap obstacle uniforms from viewport-relative measurements
    const obs = windState.obstacles;
    u.u_obsCount.value = Math.min(obs.length, 4);
    const targets = [u.u_obs1, u.u_obs2, u.u_obs3, u.u_obs4];
    for (let i = 0; i < 4; i++) {
      const v = targets[i].value;
      if (i < obs.length) {
        v.x = obs[i].x;
        v.y = obs[i].y;
        v.z = obs[i].w;
        v.w = obs[i].h;
      } else {
        v.x = 0;
        v.y = 0;
        v.z = 0;
        v.w = 0;
      }
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
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
          uniform vec3  u_particleColor;
          uniform vec4  u_obs1;
          uniform vec4  u_obs2;
          uniform vec4  u_obs3;
          uniform vec4  u_obs4;
          uniform int   u_obsCount;
          uniform float u_transition;

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
            float px = 1.0 / u_res.y;

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

              // Expand obstacle bounds outward — margin keeps particles
              // clear of the canopy edges
              float margin = 0.02;
              cL -= margin;
              cR += margin;
              cB -= margin * 0.5;
              cT += margin * 0.5;

              float rawLeftW  = max(cL, 0.001);
              float rawRightW = max(aspect - cR, 0.001);
              float obsCX  = (cL + cR) * 0.5;

              // Cap corridor width so lanes stay centered near the obstacle
              float maxCorridorW = 0.38;
              float leftW  = min(rawLeftW, maxCorridorW);
              float rightW = min(rawRightW, maxCorridorW);
              // Offset corridors to hug the obstacle edge
              float leftStart  = cL - leftW;
              float rightStart = cR;

              // Source spans full viewport width — particles originate everywhere
              // and funnel into corridors around the obstacle

              // Particles die shortly above obstacle top
              float deathCeil = cT + 0.75;

              // Blend: 0 far below obstacle → 1 at obstacle center
              float bStart = cB - 0.06;
              float bEnd   = (cB + cT) * 0.5;
              float b      = smoothstep(bStart, bEnd, p.y);

              // Above obstacle: converge back toward center before death
              float converge = smoothstep(cT + 0.12, deathCeil - 0.05, p.y);
              b = mix(b, 0.0, converge);

              // Venturi: speed multiplier peaks at obstacle center
              float venturiY = smoothstep(bStart, cB, p.y) * smoothstep(deathCeil, cT, p.y);
              float venturi  = 1.0 + venturiY * 0.5;

              // Intensity boost inside corridors
              float squeeze = b * (1.0 - converge);

              for (int layer = 0; layer < 6; layer++) {
                // Layers 0-1: slow/dim, 2-3: fast/bright, 4-5: big/sparse
                bool isBig = (layer >= 4);
                float lSeed = isBig ? float(layer - 4) * 3000.0 + 7000.0 : float(layer) * 1000.0;
                float lSpd  = isBig ? 0.06 + float(layer - 4) * 0.02
                            : ((layer < 2) ? 0.09 : 0.16);
                float lMaxA = isBig ? 0.20
                            : ((layer < 2) ? 0.10 : 0.22);
                float thick = px * (isBig ? 6.0 : 3.0);

                for (int g = 0; g < 2; g++) {
                  float seed = lSeed + (g == 0 ? 0.0 : 500.0);

                  // Source spans full viewport half, target is the capped corridor
                  float sS, sW, tS, tW;
                  if (g == 0) { sS = 0.0;    sW = obsCX;          tS = leftStart; tW = leftW; }
                  else        { sS = obsCX;   sW = aspect - obsCX; tS = rightStart; tW = rightW; }

                  // x(t,b) = (1-b)*(sS + t*sW) + b*(tS + t*tW)
                  float baseX = (1.0 - b) * sS + b * tS;
                  float scale = (1.0 - b) * sW + b * tW;
                  if (scale < px * 2.0) continue;

                  // Parameter t for this pixel
                  float t = (p.x - baseX) / scale;
                  if (t < -0.06 || t > 1.06) continue;

                  // Lane count: fill corridor at ~6px spacing (big layers: ~14px)
                  float laneSpacing = isBig ? 14.0 : 6.0;
                  float numLanes = clamp(floor(tW / (px * laneSpacing)), 2.0, 48.0);

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

                    // Lifecycle — fixed bounds, scroll-independent
                    float birthY = -0.3 - lh * 0.2;
                    float span   = 1.6 + lh * 0.4;
                    float spd    = lSpd + hash(lane * 41.3 + seed) * 0.03;
                    float cycle  = fract(u_time * spd / span + lh);
                    float headY  = birthY + cycle * span;
                    float life   = cycle;

                    float trailLen = isBig ? (0.10 + lh * 0.14) : (0.06 + lh * 0.10);
                    // Compress trails in venturi zone
                    trailLen /= venturi;
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
                    // Boost opacity in the compressed corridor
                    fa *= 1.0 + squeeze * 0.2;
                    a = max(a, fa);
                  }
                }
              }
            } else {
              // No obstacles — straight vertical lanes
              for (int layer = 0; layer < 6; layer++) {
                bool isBig = (layer >= 4);
                float seed = isBig ? float(layer - 4) * 373.0 + 7000.0 : float(layer) * 173.0;
                float lSpd = isBig ? 0.06 + float(layer - 4) * 0.02
                           : ((layer < 2) ? 0.09 : 0.16);
                float lMaxA = isBig ? 0.20
                            : ((layer < 2) ? 0.10 : 0.22);
                float thick = px * (isBig ? 6.0 : 3.0);
                float laneW = px * (isBig ? 14.0 : 6.0);
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

                  float trailLen = isBig ? (0.10 + lh * 0.14) : (0.06 + lh * 0.10);
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
            if (u_transition > 0.001) {
              float ta = mix(a, 1.0, u_transition);
              vec3 col = mix(u_bgColor, u_lineColor, ta);
              gl_FragColor = vec4(col, 1.0);
            } else {
              // Transparent overlay — cool blue-tinted particles
              gl_FragColor = vec4(u_particleColor, a);
            }
          }
        `}
      />
    </mesh>
  );
}
