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

  // Materials palette - warm architectural modernism
  const materials = useMemo(() => {
    return {
      concreteBase: new THREE.MeshStandardMaterial({
        color: "#24201b",
        roughness: 0.85,
        metalness: 0.1,
      }),
      concreteGround: new THREE.MeshStandardMaterial({
        color: "#d9d2c5",
        roughness: 0.45,
        metalness: 0.05,
      }),
      concreteUpper: new THREE.MeshStandardMaterial({
        color: "#ece6db",
        roughness: 0.4,
        metalness: 0.08,
      }),
      bronzeMetal: new THREE.MeshStandardMaterial({
        color: "#9a7b4f",
        roughness: 0.32,
        metalness: 0.65,
      }),
      darkFascia: new THREE.MeshStandardMaterial({
        color: "#1e1a16",
        roughness: 0.5,
        metalness: 0.3,
      }),
      woodDoor: new THREE.MeshStandardMaterial({
        color: "#7e5635",
        roughness: 0.55,
        metalness: 0.05,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#8aa2ad",
        transparent: true,
        opacity: 0.38,
        roughness: 0.12,
        metalness: 0.45,
      }),
      balconyGlass: new THREE.MeshStandardMaterial({
        color: "#b0c4cf",
        transparent: true,
        opacity: 0.28,
        roughness: 0.1,
        metalness: 0.5,
      }),
      gardenGrass: new THREE.MeshStandardMaterial({
        color: "#465544",
        roughness: 0.9,
        metalness: 0.02,
      }),
      paverStone: new THREE.MeshStandardMaterial({
        color: "#cfc7b9",
        roughness: 0.7,
        metalness: 0.05,
      }),
      warmGlow: new THREE.MeshBasicMaterial({
        color: "#f5d398",
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
          {/* Main architectural plinth / site slab */}
          <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
            <boxGeometry args={[6.8, 0.14, 5.2]} />
            <primitive object={materials.concreteBase} attach="material" />
          </mesh>

          {/* Stepped platform */}
          <mesh position={[-0.4, 0.18, 0.2]} receiveShadow castShadow>
            <boxGeometry args={[5.8, 0.12, 4.4]} />
            <primitive object={materials.concreteBase} attach="material" />
          </mesh>

          {/* Entrance pathway stepping pavers */}
          {[-0.6, -0.1, 0.4, 0.9].map((offsetZ, i) => (
            <mesh
              key={`paver-${i}`}
              position={[2.0 - i * 0.2, 0.25, 1.6 + offsetZ * 0.5]}
              receiveShadow
            >
              <boxGeometry args={[0.9, 0.04, 0.55]} />
              <primitive object={materials.paverStone} attach="material" />
            </mesh>
          ))}

          {/* Sunken garden planter / green court */}
          <mesh position={[-2.1, 0.25, 0.8]} receiveShadow>
            <boxGeometry args={[1.5, 0.06, 2.4]} />
            <primitive object={materials.gardenGrass} attach="material" />
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

          {/* Architectural small cypress / garden tree columns */}
          {[-2.5, -2.1, -1.7].map((x, i) => (
            <mesh key={`shrub-${i}`} position={[x, 0.52 + (i % 2) * 0.1, 1.2]} castShadow>
              <cylinderGeometry args={[0.16, 0.22, 0.55 + (i % 2) * 0.15, 8]} />
              <primitive object={materials.gardenGrass} attach="material" />
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
            <primitive object={materials.concreteGround} attach="material" />
          </mesh>

          {/* Kitchen / service utility volume */}
          <mesh position={[-1.9, 0.95, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.4, 2.0]} />
            <primitive object={materials.concreteGround} attach="material" />
          </mesh>

          {/* Recessed entrance foyer wall */}
          <mesh position={[1.1, 0.95, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.4, 0.12]} />
            <primitive object={materials.concreteGround} attach="material" />
          </mesh>

          {/* Front entrance door with teak/bronze wood paneling */}
          <mesh position={[0.7, 0.9, 0.47]} castShadow>
            <boxGeometry args={[0.65, 1.3, 0.06]} />
            <primitive object={materials.woodDoor} attach="material" />
          </mesh>
          {/* Entrance door bronze handle */}
          <mesh position={[0.45, 0.9, 0.52]}>
            <boxGeometry args={[0.03, 0.4, 0.03]} />
            <primitive object={materials.bronzeMetal} attach="material" />
          </mesh>

          {/* Entrance canopy / porch slab */}
          <mesh position={[0.85, 1.65, 0.9]} castShadow>
            <boxGeometry args={[1.6, 0.08, 1.1]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[1.55, 0.95, 1.4]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
            <primitive object={materials.bronzeMetal} attach="material" />
          </mesh>

          {/* Large floor-to-ceiling corner glass living room */}
          <mesh position={[0.45, 1.0, 1.0]}>
            <boxGeometry args={[1.8, 1.45, 0.06]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>
          <mesh position={[1.32, 1.0, 0.0]}>
            <boxGeometry args={[0.06, 1.45, 1.95]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>

          {/* Window mullions (dark bronze frames) */}
          <mesh position={[0.45, 1.7, 1.0]}>
            <boxGeometry args={[1.86, 0.05, 0.08]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[0.45, 0.28, 1.0]}>
            <boxGeometry args={[1.86, 0.05, 0.08]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[-0.45, 1.0, 1.0]}>
            <boxGeometry args={[0.05, 1.45, 0.08]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>
          <mesh position={[0.45, 1.0, 1.0]}>
            <boxGeometry args={[0.04, 1.45, 0.08]} />
            <primitive object={materials.darkFascia} attach="material" />
          </mesh>

          {/* Warm interior glowing light mesh (visible through glass) */}
          <mesh position={[0.3, 0.9, 0.2]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <primitive object={materials.warmGlow} attach="material" />
          </mesh>
          {/* Real point light for interior ambient radiation */}
          <pointLight
            position={[0.2, 1.1, 0.3]}
            intensity={0.9}
            distance={4.5}
            color="#ffdfa0"
          />
        </group>

        {/* ========================================================
            3. CANTILEVERED UPPER FLOOR & BALCONY
        ======================================================== */}
        <group ref={upperFloor}>
          {/* Main cantilever floor slab (dramatic architectural projection) */}
          <mesh position={[0.3, 1.82, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 0.14, 3.4]} />
            <primitive object={materials.concreteUpper} attach="material" />
          </mesh>

          {/* Upper master suite / primary living box */}
          <mesh position={[-0.5, 2.65, -0.2]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 1.5, 2.6]} />
            <primitive object={materials.concreteUpper} attach="material" />
          </mesh>

          {/* Cantilevered bedroom wing */}
          <mesh position={[1.2, 2.65, -0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.5, 2.0]} />
            <primitive object={materials.concreteUpper} attach="material" />
          </mesh>

          {/* Ribbon window glazing */}
          <mesh position={[1.1, 2.65, 0.62]}>
            <boxGeometry args={[1.5, 1.0, 0.05]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>

          {/* Vertical sun louvers / brise-soleil slats in bronze */}
          {[-0.5, -0.2, 0.1, 0.4].map((lx, i) => (
            <mesh key={`louver-${i}`} position={[1.0 + lx, 2.65, 0.68]} castShadow>
              <boxGeometry args={[0.04, 1.25, 0.15]} />
              <primitive object={materials.bronzeMetal} attach="material" />
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
          {/* Balcony bronze handrail cap */}
          <mesh position={[0.2, 2.56, 1.88]}>
            <boxGeometry args={[2.44, 0.04, 0.06]} />
            <primitive object={materials.bronzeMetal} attach="material" />
          </mesh>
          <mesh position={[-0.98, 2.56, 1.35]}>
            <boxGeometry args={[0.06, 0.04, 1.12]} />
            <primitive object={materials.bronzeMetal} attach="material" />
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

          {/* Rooftop pergola / shade slats over terrace */}
          {[-0.6, -0.2, 0.2, 0.6, 1.0].map((rx, i) => (
            <mesh key={`pergola-${i}`} position={[rx, 3.56, 0.9]} castShadow>
              <boxGeometry args={[0.04, 0.08, 1.4]} />
              <primitive object={materials.bronzeMetal} attach="material" />
            </mesh>
          ))}

          {/* Sleek roof parapet cap */}
          <mesh position={[0.3, 3.53, -0.1]}>
            <boxGeometry args={[4.42, 0.03, 3.22]} />
            <primitive object={materials.bronzeMetal} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
