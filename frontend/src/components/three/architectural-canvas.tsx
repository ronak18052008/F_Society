"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { ArchitecturalResidence } from "./architectural-residence";

function CameraRig({ reduced }: { reduced: boolean }) {
  const scrollRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const handleScroll = () => {
      // Gentle scroll influence (0 to 1 over first 800px)
      const maxScroll = 800;
      scrollRef.current = Math.min(window.scrollY / maxScroll, 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reduced]);

  useFrame((state) => {
    if (reduced) {
      state.camera.position.set(7.4, 3.6, 7.8);
      state.camera.lookAt(0, 1.2, 0);
      return;
    }

    const px = state.pointer.x * 0.9;
    const py = state.pointer.y * 0.45;
    const scrollFactor = scrollRef.current * 0.8;

    // Target positions with pointer parallax and scroll-dependent elevation
    const targetX = 7.4 + px + scrollFactor * 0.6;
    const targetY = 3.6 + py - scrollFactor * 0.4;
    const targetZ = 7.8 - scrollFactor * 0.5;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetX,
      0.035,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY,
      0.035,
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.035,
    );

    state.camera.lookAt(0, 1.2, 0);
  });

  return null;
}

export function ArchitecturalCanvas({
  reduced = false,
}: {
  reduced?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [7.4, 3.6, 7.8], fov: 28 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      shadows
    >
      <color attach="background" args={["#050a17"]} />
      <fog attach="fog" args={["#050a17", 13, 28]} />

      {/* Atmospheric & Directional Lighting */}
      <ambientLight intensity={0.55} color="#e0f2fe" />

      {/* Primary Pure Sunlight */}
      <directionalLight
        castShadow
        position={[7, 10, 5]}
        intensity={1.7}
        color="#ffffff"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Azure Sky Fill */}
      <directionalLight
        position={[-6, 5, -4]}
        intensity={0.45}
        color="#38bdf8"
      />

      {/* Subtle Ground Water Bounce */}
      <directionalLight
        position={[0, -4, 4]}
        intensity={0.25}
        color="#0284c7"
      />

      {/* The Procedural Modern Residence */}
      <ArchitecturalResidence reduced={reduced} />

      {/* Contact Ground Shadows */}
      <ContactShadows
        opacity={0.5}
        position={[0, -0.64, 0]}
        scale={14}
        blur={2.8}
        far={7}
      />

      <CameraRig reduced={reduced} />
    </Canvas>
  );
}
