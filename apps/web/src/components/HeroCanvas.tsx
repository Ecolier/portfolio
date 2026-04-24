import { useEffect, useRef } from "react";
import { windState } from "@/lib/canvasState";

type Palette = {
  bg: [number, number, number];
  line: [number, number, number];
  particle: [number, number, number];
  visibilityBoost: number;
};

const PALETTES: Record<"light" | "dark", Palette> = {
  light: {
    bg: [0.91, 0.929, 0.953],
    line: [0.102, 0.169, 0.251],
    particle: [0.58, 0.68, 0.78],
    visibilityBoost: 1,
  },
  dark: {
    bg: [0.043, 0.067, 0.094],
    line: [0.784, 0.855, 0.922],
    particle: [0.5, 0.62, 0.76],
    visibilityBoost: 1.0,
  },
};

const DECAY_RATE = 6;

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_bgColor;
uniform vec3  u_lineColor;
uniform vec3  u_particleColor;
uniform float u_visibilityBoost;
uniform vec4  u_obs1;
uniform vec4  u_obs2;
uniform vec4  u_obs3;
uniform vec4  u_obs4;
uniform int   u_obsCount;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453123); }

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

  float a = 0.0;

  if (u_obsCount > 0) {
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

    float margin = 0.02;
    cL -= margin;
    cR += margin;
    cB -= margin * 0.5;
    cT += margin * 0.5;

    float rawLeftW  = max(cL, 0.001);
    float rawRightW = max(aspect - cR, 0.001);
    float obsCX     = (cL + cR) * 0.5;

    float maxCorridorW = 0.38;
    float leftW  = min(rawLeftW, maxCorridorW);
    float rightW = min(rawRightW, maxCorridorW);
    float leftStart  = cL - leftW;
    float rightStart = cR;

    float deathCeil = cT + 0.75;
    float bStart = cB - 0.06;
    float bEnd   = (cB + cT) * 0.5;
    float b      = smoothstep(bStart, bEnd, p.y);

    float converge = smoothstep(cT + 0.12, deathCeil - 0.05, p.y);
    b = mix(b, 0.0, converge);

    float venturiY = smoothstep(bStart, cB, p.y) * smoothstep(deathCeil, cT, p.y);
    float venturi  = 1.0 + venturiY * 0.5;
    float squeeze = b * (1.0 - converge);

    for (int layer = 0; layer < 6; layer++) {
      bool isBig = (layer >= 4);
      float lSeed = isBig ? float(layer - 4) * 3000.0 + 7000.0 : float(layer) * 1000.0;
      float lSpd  = isBig ? 0.06 + float(layer - 4) * 0.02
                  : ((layer < 2) ? 0.09 : 0.16);
      float lMaxA = isBig ? 0.20
                  : ((layer < 2) ? 0.10 : 0.22);
      float thick = px * (isBig ? 6.0 : 3.0);

      for (int g = 0; g < 2; g++) {
        float seed = lSeed + (g == 0 ? 0.0 : 500.0);

        float sS, sW, tS, tW;
        if (g == 0) {
          sS = 0.0;
          sW = obsCX;
          tS = leftStart;
          tW = leftW;
        } else {
          sS = obsCX;
          sW = aspect - obsCX;
          tS = rightStart;
          tW = rightW;
        }

        float baseX = (1.0 - b) * sS + b * tS;
        float scale = (1.0 - b) * sW + b * tW;
        if (scale < px * 2.0) continue;

        float t = (p.x - baseX) / scale;
        if (t < -0.06 || t > 1.06) continue;

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

          float sDist = (t - laneT) * scale;
          if (abs(sDist) > thick * 3.0) continue;

          float birthY = -0.3 - lh * 0.2;
          float span   = 1.6 + lh * 0.4;
          float spd    = lSpd + hash(lane * 41.3 + seed) * 0.03;
          float cycle  = fract(u_time * spd / span + lh);
          float headY  = birthY + cycle * span;
          float life   = cycle;

          float trailLen = isBig ? (0.10 + lh * 0.14) : (0.06 + lh * 0.10);
          trailLen /= venturi;
          trailLen *= smoothstep(0.0, 0.06, life);
          trailLen *= smoothstep(1.0, 0.75, life);

          float distY = headY - p.y;
          float rad   = thick;
          if (distY < -rad || distY > trailLen + rad) continue;

          float swirlOn  = step(0.5, hash(lane * 83.9 + seed));
          float swirlAmt = smoothstep(0.6, 1.0, life) * swirlOn;
          float swirlDir = (hash(lane * 61.3 + seed) > 0.5) ? 1.0 : -1.0;
          float swirl    = sin(distY * 35.0 + u_time * 2.5 + lh * 6.28)
                         * swirlAmt * swirlDir * px * 3.0;

          float finalDist = abs(sDist + swirl);
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
          fa *= 1.0 + squeeze * 0.2;
          a = max(a, fa);
        }
      }
    }
  } else {
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

  vec3 color = mix(u_particleColor, u_lineColor, clamp(a * 2.0, 0.0, 1.0) * 0.45);
  float alpha = min(1.0, a * u_visibilityBoost);
  fragColor = vec4(mix(u_bgColor, color, alpha), 1.0);
}
`;

function getResolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  gl.deleteProgram(program);
  return null;
}

export default function HeroCanvas({ active = true }: { active?: boolean }) {
  // DIAGNOSTIC: WebGL is disabled. If the white flash still happens with
  // just this inert div, the flash is NOT coming from the WebGL canvas.
  void active;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--bg-base)",
      }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _DISABLED_HeroCanvas({ active = true }: { active?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const syncActivityRef = useRef<(() => void) | null>(null);

  activeRef.current = active;

  useEffect(() => {
    syncActivityRef.current?.();
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Create the canvas DETACHED from the DOM. This is the key to avoiding
    // Chrome's white flash: Chrome promotes a <canvas> with a WebGL context
    // to its own GPU layer the moment getContext() is called, and for one
    // compositor frame that freshly-allocated layer is composited with its
    // driver-default backing (white on most GPUs) before any drawArrays lands.
    // By doing all init + the first draw off-DOM, the canvas only enters
    // the tree when its backing store already contains real pixels, so
    // there is no "empty layer" frame to leak.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      colorSpace: "srgb",
      powerPreference: "high-performance",
    }) as WebGL2RenderingContext | null;
    if (!gl) return;

    const glCtx = gl;
    const program = createProgram(glCtx);
    if (!program) return;

    const positionLoc = glCtx.getAttribLocation(program, "a_position");
    const uTime = glCtx.getUniformLocation(program, "u_time");
    const uRes = glCtx.getUniformLocation(program, "u_res");
    const uBgColor = glCtx.getUniformLocation(program, "u_bgColor");
    const uLineColor = glCtx.getUniformLocation(program, "u_lineColor");
    const uParticleColor = glCtx.getUniformLocation(program, "u_particleColor");
    const uVisibilityBoost = glCtx.getUniformLocation(
      program,
      "u_visibilityBoost",
    );
    const uObs1 = glCtx.getUniformLocation(program, "u_obs1");
    const uObs2 = glCtx.getUniformLocation(program, "u_obs2");
    const uObs3 = glCtx.getUniformLocation(program, "u_obs3");
    const uObs4 = glCtx.getUniformLocation(program, "u_obs4");
    const uObsCount = glCtx.getUniformLocation(program, "u_obsCount");

    const buffer = glCtx.createBuffer();
    if (!buffer) {
      glCtx.deleteProgram(program);
      return;
    }

    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffer);
    glCtx.bufferData(
      glCtx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      glCtx.STATIC_DRAW,
    );

    glCtx.useProgram(program);
    glCtx.enableVertexAttribArray(positionLoc);
    glCtx.vertexAttribPointer(positionLoc, 2, glCtx.FLOAT, false, 0, 0);

    const initialPalette = PALETTES[getResolvedTheme()];
    glCtx.clearColor(
      initialPalette.bg[0],
      initialPalette.bg[1],
      initialPalette.bg[2],
      1,
    );
    glCtx.clear(glCtx.COLOR_BUFFER_BIT);

    let raf = 0;
    let isAnimating = false;
    let attached = false;
    let last = performance.now();
    const current = {
      bg: [...initialPalette.bg] as [number, number, number],
      line: [...initialPalette.line] as [number, number, number],
      particle: [...initialPalette.particle] as [number, number, number],
      visibilityBoost: initialPalette.visibilityBoost,
    };
    let target = initialPalette;

    function sizeFromHost() {
      // Size from the host div since the canvas may still be detached.
      const rect = host!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      glCtx.viewport(0, 0, canvas.width, canvas.height);
      glCtx.clear(glCtx.COLOR_BUFFER_BIT);
    }

    function lerpToward(
      from: [number, number, number],
      to: [number, number, number],
      t: number,
    ) {
      from[0] += (to[0] - from[0]) * t;
      from[1] += (to[1] - from[1]) * t;
      from[2] += (to[2] - from[2]) * t;
    }

    function drawFrame(now: number) {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const factor = 1 - Math.exp(-DECAY_RATE * delta);

      lerpToward(current.bg, target.bg, factor);
      lerpToward(current.line, target.line, factor);
      lerpToward(current.particle, target.particle, factor);
      current.visibilityBoost +=
        (target.visibilityBoost - current.visibilityBoost) * factor;

      glCtx.clear(glCtx.COLOR_BUFFER_BIT);
      glCtx.useProgram(program);

      if (uTime) glCtx.uniform1f(uTime, now / 1000);
      if (uRes) glCtx.uniform2f(uRes, canvas.width, canvas.height);
      if (uBgColor) {
        glCtx.uniform3f(uBgColor, current.bg[0], current.bg[1], current.bg[2]);
      }
      if (uLineColor) {
        glCtx.uniform3f(
          uLineColor,
          current.line[0],
          current.line[1],
          current.line[2],
        );
      }
      if (uParticleColor) {
        glCtx.uniform3f(
          uParticleColor,
          current.particle[0],
          current.particle[1],
          current.particle[2],
        );
      }
      if (uVisibilityBoost) {
        glCtx.uniform1f(uVisibilityBoost, current.visibilityBoost);
      }

      const obs = windState.obstacles.slice(0, 4);
      const packed = [uObs1, uObs2, uObs3, uObs4];
      for (let i = 0; i < 4; i++) {
        const loc = packed[i];
        const ob = obs[i];
        if (!loc) continue;
        if (ob) {
          glCtx.uniform4f(loc, ob.x, ob.y, ob.w, ob.h);
        } else {
          glCtx.uniform4f(loc, 0, 0, 0, 0);
        }
      }
      if (uObsCount) glCtx.uniform1i(uObsCount, obs.length);

      glCtx.drawArrays(glCtx.TRIANGLE_STRIP, 0, 4);
    }

    function render(now: number) {
      if (!activeRef.current || document.visibilityState !== "visible") {
        isAnimating = false;
        raf = 0;
        return;
      }
      drawFrame(now);
      raf = requestAnimationFrame(render);
    }

    function syncActivity() {
      const shouldRun =
        activeRef.current && document.visibilityState === "visible";
      if (shouldRun && !isAnimating && attached) {
        isAnimating = true;
        last = performance.now();
        raf = requestAnimationFrame(render);
      } else if (!shouldRun && isAnimating) {
        cancelAnimationFrame(raf);
        raf = 0;
        isAnimating = false;
      }
    }

    syncActivityRef.current = syncActivity;

    // 1. Size the detached canvas from the host's measured rect.
    sizeFromHost();

    // 2. Render the first real frame into the detached canvas. Because the
    //    canvas is not in the DOM, Chrome has not yet promoted it to a GPU
    //    layer, so there is no compositor activity tied to it here.
    drawFrame(performance.now());

    // 3. Force the GPU to execute the queued commands. finish() blocks
    //    until they complete, guaranteeing the backing store has real
    //    pixels before we let Chrome see the element.
    glCtx.finish();

    // 4. Attach. Now when Chrome promotes the canvas to a compositor layer,
    //    its very first composited frame shows a backing store that already
    //    contains the first rendered frame — no white flash is possible.
    host.appendChild(canvas);
    attached = true;

    syncActivity();

    const resizeObserver = new ResizeObserver(sizeFromHost);
    resizeObserver.observe(host);
    const themeObserver = new MutationObserver(() => {
      target = PALETTES[getResolvedTheme()];
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.addEventListener("visibilitychange", syncActivity);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      syncActivityRef.current = null;
      glCtx.deleteBuffer(buffer);
      glCtx.deleteProgram(program);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        // Host is a normal DOM element painted on the first frame with the
        // theme background, so the hero region is never blank or white.
        // The canvas is appended into this host only after its first draw
        // has been flushed to the GPU.
        background: "var(--bg-base)",
      }}
    />
  );
}
// Keep the disabled implementation referenced so TS does not complain.
void _DISABLED_HeroCanvas;
