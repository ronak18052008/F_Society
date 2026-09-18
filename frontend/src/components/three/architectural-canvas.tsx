"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Pavilion({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const slabs = useMemo(
    () => [
      { pos: [0, 0.08, 0] as const, size: [4.4, 0.12, 3.2] as const },
      { pos: [0, 1.7, 0] as const, size: [4.1, 0.08, 2.9] as const },
      { pos: [0.2, 2.55, -0.2] as const, size: [2.6, 0.06, 1.8] as const },
    ],
    [],
  );

  const columns = useMemo(() => {
    const pts: Array<[number, number, number]> = [];
    for (const x of [-1.8, 1.8]) {
      for (const z of [-1.2, 1.2]) pts.push([x, 0.9, z]);
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (!group.current || reduced) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.12) * 0.18;
    group.current.position.y = Math.sin(t * 0.6) * 0.04;
  });

  return (
    <group ref={group}>
      {slabs.map((slab, index) => (
        <mesh key={index} position={slab.pos} castShadow receiveShadow>
          <boxGeometry args={[...slab.size]} />
          <meshStandardMaterial
            color={index === 2 ? "#c4a574" : "#d8d0c4"}
            roughness={0.42}
            metalness={0.08}
          />
        </mesh>
      ))}
      {columns.map((pos, index) => (
        <mesh key={index} position={pos} castShadow>
          <boxGeometry args={[0.12, 1.55, 0.12]} />
          <meshStandardMaterial color="#8c8174" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.9, 0.95, 1.45]}>
        <boxGeometry args={[1.6, 1.5, 0.08]} />
        <meshStandardMaterial
          color="#9aa7a0"
          transparent
          opacity={0.22}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[1.4, 0.55, -0.2]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshStandardMaterial color="#b7a48c" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial color="#1a1713" roughness={1} />
      </mesh>
    </group>
  );
}

function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) return;
    const x = state.pointer.x * 1.4;
    const y = state.pointer.y * 0.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 6.2 + x, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 3.4 + y, 0.04);
    state.camera.lookAt(0, 1.1, 0);
  });
  return null;
}

export function ArchitecturalCanvas({ reduced = false }: { reduced?: boolean }) {
  return (
    <Canvas
      camera={{ position: [6.4, 3.5, 7.2], fov: 28 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <color attach="background" args={["#12100d"]} />
      <fog attach="fog" args={["#12100d", 10, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[6, 9, 4]}
        intensity={1.35}
        color="#f2eadb"
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 2, -4]} intensity={0.28} color="#8ea0b4" />
      <Pavilion reduced={reduced} />
      <ContactShadows opacity={0.4} scale={12} blur={2.4} far={8} />
      <CameraRig reduced={reduced} />
    </Canvas>
  );
}
