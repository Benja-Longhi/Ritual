import { Page } from "@/components/layout/Page";
import { Intro } from "@/components/landing/Intro";
import { LandingCanvas } from "@/components/landing/LandingCanvas";
import { Hero } from "@/components/landing/Hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { DayJourney } from "@/components/landing/DayJourney";
import { Commitments } from "@/components/landing/Commitments";
import { Closing } from "@/components/landing/Closing";
import { RhythmBuilder } from "@/components/ritual/RhythmBuilder";

/** La landing es un día: del alba (hero) a la noche (footer). */
export default function Home() {
  return (
    <Page>
      <Intro />
      {/* Primero: la escena 3D fija queda debajo de todas las secciones (que van posicionadas) */}
      <LandingCanvas />
      <Hero />
      <Manifesto />
      <DayJourney />
      <RhythmBuilder />
      <Commitments />
      <Closing />
    </Page>
  );
}
