/**
 * The whole sky, in one fragment shader.
 *
 * Nothing here is 3D — there is no scene, no camera, no mesh. A gradient, a
 * disc, angular rays, stars and motes are all screen-space work, which is why
 * this needs raw WebGL2 rather than a 3D library.
 *
 * This shader DECIDES nothing. Sun position, ray strength and star opacity all
 * arrive as uniforms from `sky-palette.ts`, where they are unit-tested. Keep it
 * that way: physics in TypeScript, drawing in GLSL.
 *
 * Built up one layer at a time: gradient (here), then the sun's disc and rays,
 * then stars and motes. `sky-field.ts` already sets every uniform any layer
 * will need, so adding a layer means adding GLSL and nothing else.
 */

/**
 * A full-screen triangle from gl_VertexID alone — no buffers, no attributes,
 * no vertex array object. Draw with `gl.drawArrays(gl.TRIANGLES, 0, 3)`.
 */
export const SKY_VERT = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  vec2 p = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  vUv = (p + 1.0) * 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

export const SKY_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;          // seconds
uniform vec3  uSkyHigh;       // zenith colour, sRGB 0-1
uniform vec3  uSkyLow;        // horizon colour, sRGB 0-1
uniform vec3  uLight;         // sun/moon colour, sRGB 0-1
uniform vec2  uSunPos;        // 0-1, y measured DOWN from the top
uniform float uIsNight;       // 0 or 1
uniform float uMotion;        // 1 normally, 0.1 under reduced motion
uniform float uRayStrength;   // 0-1, already altitude-scaled
uniform float uStarOpacity;   // 0-1

// -- hashes -----------------------------------------------------------------

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// -- pieces -----------------------------------------------------------------

/** Vertical gradient, mixed in linear space so it does not go chalky. */
vec3 gradient(vec2 uv) {
  vec3 hi = uSkyHigh * uSkyHigh;   // cheap approximate sRGB -> linear
  vec3 lo = uSkyLow  * uSkyLow;
  vec3 lin = mix(hi, lo, smoothstep(0.0, 1.0, uv.y));
  return sqrt(lin);                // back to sRGB
}

/**
 * The disc and its bloom. Restrained on purpose: a glow, not a textured
 * sprite with craters or a detailed corona.
 */
vec3 disc(vec2 uv, float aspect) {
  vec2 d = vec2((uv.x - uSunPos.x) * aspect, uv.y - uSunPos.y);
  float r = length(d);

  float core  = smoothstep(0.028, 0.012, r);
  float bloom = pow(max(0.0, 1.0 - r / 0.55), 3.0);

  // The moon is smaller and cooler, and gets a faint halo instead of a bloom.
  float halo = uIsNight * pow(max(0.0, 1.0 - r / 0.16), 6.0) * 0.5;

  float amount = mix(core + bloom * 0.55, core * 0.8 + halo, uIsNight);
  return uLight * amount;
}

/**
 * Angular shafts. Two frequencies plus a slow drift so they never read as a
 * clean starburst. Multiplied by uRayStrength, which is zero at night and
 * near zero at noon — the effect limits itself.
 */
vec3 rays(vec2 uv, float aspect) {
  if (uRayStrength <= 0.001) return vec3(0.0);

  vec2 d = vec2((uv.x - uSunPos.x) * aspect, uv.y - uSunPos.y);
  float r = length(d);
  float a = atan(d.y, d.x);

  float t = uTime * 0.03 * uMotion;
  float s1 = 0.5 + 0.5 * sin(a * 9.0  + t);
  float s2 = 0.5 + 0.5 * sin(a * 17.0 - t * 1.7);
  float s3 = 0.5 + 0.5 * sin(a * 4.0  + t * 0.5);

  float shafts = pow(s1 * 0.55 + s2 * 0.25 + s3 * 0.2, 2.2);

  // Fade out from the disc, and never start inside it.
  float falloff = smoothstep(0.9, 0.05, r) * smoothstep(0.02, 0.09, r);

  return uLight * shafts * falloff * uRayStrength * 0.32;
}

/** Hash-grid stars. Night only — a constellation in daylight is a lie. */
vec3 stars(vec2 uv, float aspect) {
  if (uStarOpacity <= 0.001) return vec3(0.0);

  vec2 g = vec2(uv.x * aspect, uv.y) * 90.0;
  vec2 cell = floor(g);
  vec2 f = fract(g);

  float h = hash21(cell);
  if (h < 0.986) return vec3(0.0);

  vec2 centre = vec2(hash21(cell + 3.1), hash21(cell + 7.7));
  float d = length(f - centre);
  float point = smoothstep(0.14, 0.0, d);

  float twinkle = 0.65 + 0.35 * sin(uTime * 0.8 * uMotion + h * 40.0);

  // Thin out toward the horizon, where the sky is brightest.
  float height = smoothstep(0.75, 0.1, uv.y);

  return vec3(0.92, 0.95, 1.0) * point * twinkle * height * uStarOpacity;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y;   // measure y downward, matching sunY

  vec3 col = gradient(uv);
  col += disc(uv, aspect);
  col += rays(uv, aspect);
  col += stars(uv, aspect);

  // Ordered-ish dither. Wide two-colour gradients band badly without it.
  float dither = (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
  col += dither;

  fragColor = vec4(col, 1.0);
}`;
