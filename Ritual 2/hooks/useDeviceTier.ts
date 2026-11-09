"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "high" | "low" | "static";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function detect(): DeviceTier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  if (!gl) return "static";
  // WebGL por software (sin GPU real): la escena trabaría el hilo principal.
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "static";
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return "low";
  if ((nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4) return "low";
  return "high";
}

let cached: DeviceTier | null = null;

/**
 * Qué tan ambiciosa puede ser la escena 3D en este dispositivo.
 * `static` = sin WebGL, WebGL por software o reduced-motion: se muestra una ilustración.
 */
export function useDeviceTier(): DeviceTier | null {
  return useSyncExternalStore(
    () => () => {},
    () => (cached ??= detect()),
    () => null,
  );
}
