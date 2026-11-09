"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { light, palette } from "@/lib/palette";

/**
 * Luz de estudio para packshots: cajas de luz largas a los costados (las
 * franjas de brillo verticales que hacen leer un cilindro) y una cálida
 * arriba, como la primera luz. Todo procedural: no se descarga ningún HDR.
 */
export function Studio({ warm = palette.papel, resolution = 256 }: { warm?: string; resolution?: number }) {
  return (
    <>
      <ambientLight intensity={0.45} color={warm} />
      <hemisphereLight args={[palette.papelClaro, palette.cafe, 0.5]} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} color={palette.papelClaro} />
      <directionalLight position={[-5, 2, -3]} intensity={0.9} color={light.prisma} />
      <Environment resolution={resolution} frames={1}>
        <Lightformer form="rect" intensity={2.2} color={palette.papelClaro} position={[0, 5, 3]} scale={[8, 3, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={3} color={palette.papelClaro} position={[-4, 0.5, 2]} scale={[0.8, 7, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={2.2} color={palette.papelClaro} position={[4, 0.5, 2]} scale={[0.6, 7, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer form="rect" intensity={1.2} color={light.prisma} position={[0, -3, -3]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={1.4} color={light.alba} position={[3, 3, -4]} scale={2.5} />
      </Environment>
    </>
  );
}
