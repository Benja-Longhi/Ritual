/**
 * Shaders del astro. Ruido simplex 3D de Ashima Arts / Stefan Gustavson
 * (licencia MIT), compartido por el vértice y el fragmento.
 */

const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/** El cuerpo: respira con ruido, se facetea (Prisma) y se disuelve (Génesis). */
export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uNoise;
uniform float uBreath;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vObjPos;
${noise}
void main() {
  vec3 p = position;
  float n = snoise(p * 1.4 + vec3(0.0, uTime * 0.11, 0.0));
  // Mantra: 4 s inhalar, 4 s exhalar.
  float breath = sin(uTime * 0.7854) * 0.5 + 0.5;
  p += normal * (n * uNoise + breath * uBreath * 0.05);
  vObjPos = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vViewPos = -mv.xyz;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const coreFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uRim;
uniform float uRimStrength;
uniform float uFacet;
uniform float uBands;
uniform vec3 uBand1;
uniform vec3 uBand2;
uniform vec3 uBand3;
uniform float uDissolve;
uniform float uOpacity;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vObjPos;
${noise}
void main() {
  vec3 n = normalize(vViewNormal);
  // Prisma: las normales se cuantizan en caras grandes, como un cristal tallado.
  vec3 q = normalize(floor(n * 1.45 + 0.5));
  n = normalize(mix(n, q, uFacet));
  vec3 v = normalize(vViewPos);
  vec3 L = normalize(vec3(-0.45, 0.7, 0.55));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float h = clamp(vObjPos.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, smoothstep(0.05, 0.95, h)) * (0.62 + 0.38 * diff);

  // La luz que se descompone, pero en los tonos de la paleta.
  float t = dot(n, normalize(vec3(0.6, 0.35, 0.7))) * 2.4 + uTime * 0.04;
  float b = fract(t);
  vec3 band = b < 0.333 ? uBand1 : (b < 0.666 ? uBand2 : uBand3);
  col = mix(col, band * (0.78 + 0.22 * diff), uBands * 0.6);

  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.4);
  col += uRim * fres * uRimStrength;
  vec3 hv = normalize(L + v);
  col += vec3(pow(max(dot(n, hv), 0.0), 36.0) * 0.16);

  // Génesis: se disuelve en células, con un borde de luz donde se abre.
  // Las células se abren y se cierran despacio: la piel que se rehace.
  float dissolve = uDissolve * (0.5 + 0.5 * sin(uTime * 0.55));
  if (dissolve > 0.001) {
    float d = snoise(vObjPos * 4.2 + vec3(uTime * 0.12)) * 0.5 + 0.5;
    if (d < dissolve) discard;
    col = mix(uRim * 1.15, col, smoothstep(dissolve, dissolve + 0.06, d));
  }
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;

/** Halo / corona: un brillo en el borde de una cáscara más grande. */
export const haloVertex = /* glsl */ `
varying vec3 vViewNormal;
varying vec3 vViewPos;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = -mv.xyz;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const haloFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec3 vViewNormal;
varying vec3 vViewPos;
void main() {
  float f = 1.0 - abs(dot(normalize(vViewNormal), normalize(vViewPos)));
  float a = pow(f, 3.2) * uStrength;
  gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  #include <colorspace_fragment>
}
`;

/** Génesis: partículas que salen del astro y vuelven, como células que se rehacen. */
export const seedVertex = /* glsl */ `
uniform float uTime;
uniform float uSpread;
uniform float uSize;
attribute float aSeed;
varying float vAlpha;
void main() {
  float cycle = sin(uTime * 0.5 + aSeed * 6.2831) * 0.5 + 0.5;
  vec3 p = position * (1.0 + uSpread * (0.25 + cycle * 0.9));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.6 + aSeed * 0.8) * (10.0 / -mv.z);
  vAlpha = 0.35 + cycle * 0.65;
}
`;

export const seedFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha * uOpacity;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

/** Mantra: anillos que se abren y se apagan, uno detrás del otro. */
export const ringFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
  #include <colorspace_fragment>
}
`;

export const ringVertex = /* glsl */ `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
