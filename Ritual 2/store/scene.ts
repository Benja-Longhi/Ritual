"use client";

import { create } from "zustand";

/**
 * Cómo se muestran los productos de la landing:
 * - `pending`: el 3D está cargando (las anclas quedan vacías, sin parpadeo SVG → 3D).
 * - `3d`: la escena 3D ya dibuja.
 * - `svg`: sin 3D (reduced-motion, sin GPU o si tardó demasiado): packshots SVG.
 */
export type SceneMode = "pending" | "3d" | "svg";

type SceneStore = {
  mode: SceneMode;
  setMode: (mode: SceneMode) => void;
};

export const useScene = create<SceneStore>()((set) => ({
  mode: "pending",
  setMode: (mode) => set({ mode }),
}));
