import * as THREE from "three";

type Origin = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export type SideRaysConfig = {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: Origin;
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
};

const hexToVec3 = (hex: string): THREE.Vector3 => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? new THREE.Vector3(
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
      )
    : new THREE.Vector3(1, 1, 1);
};

const originToFlip = (origin: Origin): [number, number] => {
  switch (origin) {
    case "top-left":
      return [1, 0];
    case "bottom-right":
      return [0, 1];
    case "bottom-left":
      return [1, 1];
    default:
      return [0, 0];
  }
};

const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

export function createSideRaysField(
  container: HTMLElement,
  config: SideRaysConfig = {}
): { cleanup: () => void; update: (cfg: SideRaysConfig) => void } {
  const {
    speed = 1.2,
    rayColor1 = "#E8B84B",
    rayColor2 = "#F5DFA0",
    intensity = 1.4,
    spread = 1.8,
    origin = "top-right",
    tilt = 0,
    saturation = 1.2,
    blend = 0.6,
    falloff = 1.8,
    opacity = 0.85,
  } = config;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const canvas = renderer.domElement;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const geometry = new THREE.PlaneGeometry(2, 2);

  const [flipX, flipY] = originToFlip(origin);
  const uniforms: Record<string, THREE.IUniform> = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(1, 1) },
    iSpeed: { value: speed },
    iRayColor1: { value: hexToVec3(rayColor1) },
    iRayColor2: { value: hexToVec3(rayColor2) },
    iIntensity: { value: intensity },
    iSpread: { value: spread },
    iFlipX: { value: flipX },
    iFlipY: { value: flipY },
    iTilt: { value: tilt },
    iSaturation: { value: saturation },
    iBlend: { value: blend },
    iFalloff: { value: falloff },
    iOpacity: { value: opacity },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const updateSize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    (uniforms.iResolution.value as THREE.Vector2).set(w * dpr, h * dpr);
  };

  let animId: number | null = null;

  const loop = (t: number) => {
    uniforms.iTime.value = t * 0.001;
    renderer.render(scene, camera);
    animId = requestAnimationFrame(loop);
  };

  window.addEventListener("resize", updateSize);
  updateSize();
  animId = requestAnimationFrame(loop);

  const update = (cfg: SideRaysConfig) => {
    if (cfg.speed !== undefined) uniforms.iSpeed.value = cfg.speed;
    if (cfg.rayColor1 !== undefined)
      uniforms.iRayColor1.value = hexToVec3(cfg.rayColor1);
    if (cfg.rayColor2 !== undefined)
      uniforms.iRayColor2.value = hexToVec3(cfg.rayColor2);
    if (cfg.intensity !== undefined) uniforms.iIntensity.value = cfg.intensity;
    if (cfg.spread !== undefined) uniforms.iSpread.value = cfg.spread;
    if (cfg.origin !== undefined) {
      const [fx, fy] = originToFlip(cfg.origin);
      uniforms.iFlipX.value = fx;
      uniforms.iFlipY.value = fy;
    }
    if (cfg.tilt !== undefined) uniforms.iTilt.value = cfg.tilt;
    if (cfg.saturation !== undefined)
      uniforms.iSaturation.value = cfg.saturation;
    if (cfg.blend !== undefined) uniforms.iBlend.value = cfg.blend;
    if (cfg.falloff !== undefined) uniforms.iFalloff.value = cfg.falloff;
    if (cfg.opacity !== undefined) uniforms.iOpacity.value = cfg.opacity;
  };

  const cleanup = () => {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener("resize", updateSize);
    material.dispose();
    geometry.dispose();
    renderer.dispose();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };

  return { cleanup, update };
}
