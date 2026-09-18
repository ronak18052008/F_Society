"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface ResidenceProps {
  reduced?: boolean;
}

export function ArchitecturalResidence({ reduced = false }: ResidenceProps) {
  const rootGroup = useRef<THREE.Group>(null);
  const houseGroup = useRef<THREE.Group>(null);
  const lowerFloor = useRef<THREE.Group>(null);
  const upperFloor = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const landscape = useRef<THREE.Group>(null);

  // Materials palette - NIVASA Luminous Spatial Living
  const materials = useMemo(() => {
    return {
      podium: new THREE.MeshStandardMaterial({
        color: "#0c1527",
        roughness: 0.35,
        metalness: 0.3,
      }),
      waterPool: new THREE.MeshStandardMaterial({
        color: "#0284c7",
        roughness: 0.08,
        metalness: 0.8,
        transparent: true,
        opacity: 0.75,
      }),
      alabasterWall: new THREE.MeshStandardMaterial({
        color: "#f8fafc",
        roughness: 0.2,
        metalness: 0.05,
      }),
      cobaltFrame: new THREE.MeshStandardMaterial({
        color: "#2563eb",
        roughness: 0.25,
        metalness: 0.75,
      }),
      darkFascia: new THREE.MeshStandardMaterial({
        color: "#0f172a",
        roughness: 0.3,
        metalness: 0.4,
      }),
      deckWood: new THREE.MeshStandardMaterial({
        color: "#cbd5e1",
        roughness: 0.5,
        metalness: 0.1,
      }),
      crystalGlass: new THREE.MeshStandardMaterial({
        color: "#7dd3fc",
        transparent: true,
        opacity: 0.32,
        roughness: 0.05,
        metalness: 0.9,
      }),
      balconyGlass: new THREE.MeshStandardMaterial({
        color: "#a5f3fc",
        transparent: true,
        opacity: 0.25,
        roughness: 0.08,
        metalness: 0.6,
      }),
      gardenFlora: new THREE.MeshStandardMaterial({
        color: "#0d9488",
        roughness: 0.6,
        metalness: 0.1,
      }),
      paverStone: new THREE.MeshStandardMaterial({
        color: "#e2e8f0",
        roughness: 0.4,
        metalness: 0.1,
      }),
      interiorGlow: new THREE.MeshBasicMaterial({
        color: "#93c5fd",
      }),
      accentBeacon: new THREE.MeshBasicMaterial({
        color: "#38bdf8",
      }),
    };
  }, []);

  // Entrance timeline with GSAP
  useGSAP(
    () => {
      if (!houseGroup.current || reduced) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Set initial positions for assembly
        if (landscape.current) {
          gsap.set(landscape.current.position, { y: -0.8 });
          gsap.set(landscape.current.scale, { x: 0.92, z: 0.92 });
        }
        if (lowerFloor.current) {
          gsap.set(lowerFloor.current.position, { y: -0.6 });
        }
        if (upperFloor.current) {
          gsap.set(upperFloor.current.position, { y: 0.8 });
        }
        if (roof.current) {
          gsap.set(roof.current.position, { y: 1.2 });
        }

        tl.to(
          landscape.current ? landscape.current.position : {},
          { y: 0, duration: 1.2 },
          0.1,
        )
          .to(
            landscape.current ? landscape.current.scale : {},
            { x: 1, z: 1, duration: 1.2 },
            0.1,
          )
          .to(
            lowerFloor.current ? lowerFloor.current.position : {},
            { y: 0, duration: 1.3 },
            0.3,
          )
          .to(
            upperFloor.current ? upperFloor.current.position : {},
            { y: 0, duration: 1.4 },
            0.5,
          )
          .to(
            roof.current ? roof.current.position : {},
            { y: 0, duration: 1.4 },
            0.7,
          );
      });

      return () => mm.revert();
    },
    { scope: rootGroup, dependencies: [reduced] },
  );

  // Gentle pointer & breathing movement
  useFrame((state) => {
    if (!rootGroup.current || reduced) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x * 0.12;
    const py = state.pointer.y * 0.08;

    // Subtle breathing rotation & responsive pointer tilt
    rootGroup.current.rotation.y =
      Math.sin(t * 0.1) * 0.08 - 0.25 + px;
    rootGroup.current.rotation.x =
      0.02 + py * 0.5 + Math.cos(t * 0.15) * 0.01;
    rootGroup.current.position.y = Math.sin(t * 0.4) * 0.025;
  });

  return (
    <group ref={rootGroup} position={[0, -0.65, 0]}>
      <group ref={houseGroup}>
        {/* ========================================================
            1. LANDSCAPE & FOUNDATION PODIUM
        ======================================================== */}
        <group ref={landscape}>
          {/* Main architectural plinth / podium */}
          <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
            <boxGeometry args={[6.8, 0.14, 5.2]} />
            <primitive object={materials.podium} attach="material" />
          </mesh>

          {/* Stepped platform */}
          <mesh position={[-0.4, 0.18, 0.2]} receiveShadow castShadow>
            <boxGeometry args={[5.8, 0.12, 4.4]} />
            <primitive object={materials.podium} attach="material" />
          </mesh>

          {/* Water reflection basin */}
          <mesh position={[1.4, 0.2, 0.8]} receiveShadow>
            <boxGeometry args={[2.2, 0.08, 1.8]} />
            <primitive object={materials.waterPool} attach="material" />
          </mesh>

          {/* Stepping pavers over reflection water */}
          {[-0.5, 0.0, 0.5].map((offsetZ, i) => (
            <mesh
              key={`paver-${i}`}
              position={[1.4, 0.26, 0.8 + offsetZ * 0.9]}
              receiveShadow
            >
              <boxGeometry args={[0.8, 0.05, 0.55]} />
              <primitive object={materials.paverStone} attach="material" />
            </mesh>
          ))}

          {/* Modern minimalist flora planter */}
          <mesh position={[-2.1, 0.25, 0.8]} receiveShadow>
            <boxGeometry args={[1.5, 0.06, 2.4]} />
            <primitive object={materials.gardenFlora} attach="material" />
          </mesh>

          {/* Planter border curb */}
          <mesh position={[-2.1, 0.29, 2.05]}>
            <boxGeometry args={[1.58, 0.08, 0.08]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[-1.31, 0.29, 0.8]}>
            <boxGeometry args={[0.08, 0.08, 2.48]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>

          {/* Sculptural flora columns */}
          {[-2.5, -2.1, -1.7].map((x, i) => (
            <mesh key={`shrub-${i}`} position={[x, 0.52 + (i % 2) * 0.1, 1.2]} castShadow>
              <cylinderGeometry args={[0.14, 0.18, 0.55 + (i % 2) * 0.15, 8]} />
              <primitive object={materials.gardenFlora} attach="material" />
            </mesh>
          ))}
        </group>

        {/* ========================================================
            2. GROUND FLOOR RESIDENCE
        ======================================================== */}
        <group ref={lowerFloor}>
          {/* Main living room masonry back / side wall */}
          <mesh position={[-0.8, 1.05, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 1.6, 2.6]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Service utility volume */}
          <mesh position={[-1.9, 0.95, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.4, 2.0]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Recessed entrance foyer wall */}
          <mesh position={[1.1, 0.95, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.4, 0.12]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Front entrance door with bleached wood paneling */}
          <mesh position={[0.7, 0.9, 0.47]} castShadow>
            <boxGeometry args={[0.65, 1.3, 0.06]} />
            <primitive object={materials.deckWood} attach="material" />
          </mesh>
          {/* Entrance door cobalt handle */}
          <mesh position={[0.45, 0.9, 0.52]}>
            <boxGeometry args={[0.03, 0.4, 0.03]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>

          {/* Entrance canopy / porch slab */}
          <mesh position={[0.85, 1.65, 0.9]} castShadow>
            <boxGeometry args={[1.6, 0.08, 1.1]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[1.55, 0.95, 1.4]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>

          {/* Large floor-to-ceiling corner crystal glass */}
          <mesh position={[0.45, 1.0, 1.0]}>
            <boxGeometry args={[1.8, 1.45, 0.06]} />
            <primitive object={materials.crystalGlass} attach="material" />
          </mesh>
          <mesh position={[1.32, 1.0, 0.0]}>
            <boxGeometry args={[0.06, 1.45, 1.95]} />
            <primitive object={materials.crystalGlass} attach="material" />
          </mesh>

          {/* Window mullions (sleek cobalt frames) */}
          <mesh position={[0.45, 1.7, 1.0]}>
            <boxGeometry args={[1.86, 0.05, 0.08]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
          <mesh position={[0.45, 0.28, 1.0]}>
            <boxGeometry args={[1.86, 0.05, 0.08]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
          <mesh position={[-0.45, 1.0, 1.0]}>
            <boxGeometry args={[0.05, 1.45, 0.08]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
          <mesh position={[0.45, 1.0, 1.0]}>
            <boxGeometry args={[0.04, 1.45, 0.08]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>

          {/* Luminous interior glow */}
          <mesh position={[0.3, 0.9, 0.2]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <primitive object={materials.interiorGlow} attach="material" />
          </mesh>
          <pointLight
            position={[0.2, 1.1, 0.3]}
            intensity={1.2}
            distance={5.0}
            color="#60a5fa"
          />
        </group>

        {/* ========================================================
            3. CANTILEVERED UPPER FLOOR & BALCONY
        ======================================================== */}
        <group ref={upperFloor}>
          {/* Main cantilever floor slab */}
          <mesh position={[0.3, 1.82, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 0.14, 3.4]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Upper master suite living box */}
          <mesh position={[-0.5, 2.65, -0.2]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 1.5, 2.6]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Cantilevered bedroom wing */}
          <mesh position={[1.2, 2.65, -0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.5, 2.0]} />
            <primitive object={materials.alabasterWall} attach="material" />
          </mesh>

          {/* Ribbon window glazing */}
          <mesh position={[1.1, 2.65, 0.62]}>
            <boxGeometry args={[1.5, 1.0, 0.05]} />
            <primitive object={materials.crystalGlass} attach="material" />
          </mesh>

          {/* Vertical sun louvers / brise-soleil slats in cobalt */}
          {[-0.5, -0.2, 0.1, 0.4].map((lx, i) => (
            <mesh key={`louver-${i}`} position={[1.0 + lx, 2.65, 0.68]} castShadow>
              <boxGeometry args={[0.04, 1.25, 0.15]} />
              <primitive object={materials.cobaltFrame} attach="material" />
            </mesh>
          ))}

          {/* Balcony terrace floor */}
          <mesh position={[0.2, 1.88, 1.35]} receiveShadow>
            <boxGeometry args={[2.4, 0.04, 1.1]} />
            <primitive object={materials.paverStone} attach="material" />
          </mesh>

          {/* Balcony glass railing balustrade */}
          <mesh position={[0.2, 2.22, 1.88]}>
            <boxGeometry args={[2.4, 0.65, 0.04]} />
            <primitive object={materials.balconyGlass} attach="material" />
          </mesh>
          <mesh position={[-0.98, 2.22, 1.35]}>
            <boxGeometry args={[0.04, 0.65, 1.08]} />
            <primitive object={materials.balconyGlass} attach="material" />
          </mesh>
          {/* Balcony cobalt handrail cap */}
          <mesh position={[0.2, 2.56, 1.88]}>
            <boxGeometry args={[2.44, 0.04, 0.06]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
          <mesh position={[-0.98, 2.56, 1.35]}>
            <boxGeometry args={[0.06, 0.04, 1.12]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
        </group>

        {/* ========================================================
            4. ROOFLINE & ARCHITECTURAL CANOPY
        ======================================================== */}
        <group ref={roof}>
          {/* Upper roof floating overhang */}
          <mesh position={[0.3, 3.46, -0.1]} castShadow>
            <boxGeometry args={[4.4, 0.12, 3.2]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>

          {/* Rooftop pergola / shade slats over terrace in cobalt */}
          {[-0.6, -0.2, 0.2, 0.6, 1.0].map((rx, i) => (
            <mesh key={`pergola-${i}`} position={[rx, 3.56, 0.9]} castShadow>
              <boxGeometry args={[0.04, 0.08, 1.4]} />
              <primitive object={materials.cobaltFrame} attach="material" />
            </mesh>
          ))}

          {/* Sleek roof parapet cap */}
          <mesh position={[0.3, 3.53, -0.1]}>
            <boxGeometry args={[4.42, 0.03, 3.22]} />
            <primitive object={materials.cobaltFrame} attach="material" />
          </mesh>
        </group>

        {/* Luminous ambient floating particles */}
        <group position={[0, 1.8, 0]}>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 3.2 + (i % 3) * 0.4;
            const y = Math.sin(i * 1.5) * 1.2;
            return (
              <mesh key={`part-${i}`} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
                <sphereGeometry args={[0.028, 8, 8]} />
                <primitive object={materials.accentBeacon} attach="material" />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}
