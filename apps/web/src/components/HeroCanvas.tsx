import { Canvas } from "@react-three/fiber";
import TrippyPlane from "@/components/TrippyPlane";

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 3, 12], fov: 55, near: 0.1, far: 200 }}
      gl={{ alpha: true }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <TrippyPlane />
    </Canvas>
  );
}
