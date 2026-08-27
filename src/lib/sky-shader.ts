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

uniform vec3  uSkyHigh;       // zenith colour, sRGB 0-1
uniform vec3  uSkyLow;        // horizon colour, sRGB 0-1

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

void main() {
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y;   // measure y downward, matching sunY

  vec3 col = gradient(uv);

  // Ordered-ish dither. Wide two-colour gradients band badly without it.
  float dither = (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
  col += dither;

  fragColor = vec4(col, 1.0);
}`;
