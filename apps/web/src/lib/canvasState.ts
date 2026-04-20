import type * as THREE from "three";

// Shared ref so the transition system can access the shader material
export const shaderMaterialRef = {
  current: null as THREE.ShaderMaterial | null,
};

// Module-level state: obstacle rectangles in UV coords (0-1, bottom-left origin)
export const windState = {
  obstacles: [] as Array<{ x: number; y: number; w: number; h: number }>,
};
