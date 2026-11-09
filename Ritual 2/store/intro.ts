"use client";

import { create } from "zustand";

type IntroState = {
  /** La intro terminó (o no corresponde mostrarla): el hero puede entrar. */
  done: boolean;
  finish: () => void;
};

export const useIntro = create<IntroState>()((set) => ({
  done: false,
  finish: () => set({ done: true }),
}));
