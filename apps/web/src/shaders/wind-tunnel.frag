#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2  u_res;
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

    // Analytical derivative of b w.r.t. p.y.
    // b = smoothstep(bStart,bEnd,y) * (1 - smoothstep(cT+0.12, deathCeil-0.05, y))
    // Used below to compute each lane's path slope so the SDF measures
    // perpendicular distance rather than horizontal distance.
    float _bRange = max(bEnd - bStart, 1e-5);
    float _bt = clamp((p.y - bStart) / _bRange, 0.0, 1.0);
    float _cEdge = cT + 0.12;
    float _cRange = max((deathCeil - 0.05) - _cEdge, 1e-5);
    float _ct = clamp((p.y - _cEdge) / _cRange, 0.0, 1.0);
    float db_dy = 6.0 * _bt * (1.0 - _bt) / _bRange * (1.0 - converge)
               - smoothstep(bStart, bEnd, p.y) * 6.0 * _ct * (1.0 - _ct) / _cRange;

    for (int layer = 0; layer < 4; layer++) {
      bool isBig = (layer >= 3);
      float lSeed = isBig ? float(layer - 3) * 3000.0 + 7000.0 : float(layer) * 1000.0;
      float lSpd  = isBig ? 0.06
                  : ((layer < 2) ? 0.09 : 0.13);
      float lMaxA = isBig ? 0.22
                  : ((layer < 2) ? 0.13 : 0.24);
      float thick = px * (isBig ? 8.0 : 5.0);

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

        float laneSpacing = isBig ? 22.0 : 11.0;
        float numLanes = clamp(floor(tW / (px * laneSpacing)), 2.0, 28.0);
        float laneF = t * numLanes - 0.5;
        float bLane = floor(laneF);

        for (float di = 0.0; di <= 2.0; di += 1.0) {
          float lane = bLane + di;
          if (lane < 0.0 || lane >= numLanes) continue;

          float lh = hash(lane * 127.1 + seed);
          if (lh < 0.30) continue;

          float laneT = (lane + 0.5) / numLanes;
          laneT += (hash(lane * 311.7 + seed) - 0.5) * 0.5 / numLanes;

          float sDist = (t - laneT) * scale;
          if (abs(sDist) > thick * 3.0) continue;

          // Lane path slope: dx_center / dy for this lane.
          // cx(y) = baseX(y) + laneT * scale(y), so dcx/dy = db_dy * ((tS-sS) + laneT*(tW-sW))
          // Dividing sDist by sqrt(1 + slope²) converts horizontal distance to
          // perpendicular distance, keeping visual thickness constant when deflecting.
          float dcx_dy = db_dy * ((tS - sS) + laneT * (tW - sW));
          float invLen  = 1.0 / sqrt(1.0 + dcx_dy * dcx_dy);

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

          float finalDist = abs((sDist + swirl) * invLen);
          // True screen-space capsule SDF for an angled lane.
          // Key identity: finalDist² + along_tail² = screen_dist_to_head²
          // so clamping along_tail to [0, trailLen_lane] gives exact circular caps.
          float sDistSwirled  = sDist + swirl;
          float len           = 1.0 / invLen;
          float along_tail    = distY * len - sDistSwirled * dcx_dy * invLen;
          float trailLen_lane = trailLen * len;
          float excess        = along_tail - clamp(along_tail, 0.0, trailLen_lane);
          float sdf           = sqrt(finalDist * finalDist + excess * excess) - rad;

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
    for (int layer = 0; layer < 4; layer++) {
      bool isBig = (layer >= 3);
      float seed = isBig ? float(layer - 3) * 373.0 + 7000.0 : float(layer) * 173.0;
      float lSpd = isBig ? 0.06
                 : ((layer < 2) ? 0.09 : 0.13);
      float lMaxA = isBig ? 0.22
                  : ((layer < 2) ? 0.13 : 0.24);
      float thick = px * (isBig ? 8.0 : 5.0);
      float laneW = px * (isBig ? 22.0 : 11.0);
      float laneIdx = floor(p.x / laneW);

      for (float di = -1.0; di <= 1.0; di += 1.0) {
        float lane = laneIdx + di;
        float lh   = hash(lane * 127.1 + seed);
        if (lh < 0.30) continue;

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
  fragColor = vec4(color, alpha);
}