import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function createCrescentGeometry(
  outerRadius = 0.28,
  innerRadius = 0.22,
  offsetX = 0.11,
  depth = 0.035
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();

  // Outer arc from top tip to bottom tip (counter-clockwise on left side)
  const startAngle = Math.PI * 0.38;
  const endAngle = Math.PI * 1.62;
  shape.absarc(0, 0, outerRadius, startAngle, endAngle, false);

  // Inner arc back up to close the tapered crescent
  const innerStartAngle = Math.atan2(
    Math.sin(endAngle) * outerRadius,
    Math.cos(endAngle) * outerRadius - offsetX
  );
  const innerEndAngle = Math.atan2(
    Math.sin(startAngle) * outerRadius,
    Math.cos(startAngle) * outerRadius - offsetX
  );

  shape.absarc(offsetX, 0, innerRadius, innerStartAngle, innerEndAngle, true);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.016,
    bevelSegments: 8,
    curveSegments: 64,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function createStarGeometry(
  points = 5,
  outerRadius = 0.1,
  innerRadius = 0.044,
  depth = 0.024
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const step = Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.01,
    bevelSegments: 5,
    curveSegments: 16,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

export function CrescentMoonWithStar3D({
  position = [1.12, 0.98, -0.55] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const starRef = useRef<THREE.Mesh>(null);

  const moonGeo = useMemo(() => createCrescentGeometry(0.28, 0.225, 0.115, 0.036), []);
  const starGeo = useMemo(() => createStarGeometry(5, 0.085, 0.036, 0.022), []);

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.z = state.clock.elapsedTime * 0.45;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.14} floatIntensity={0.28}>
      <group position={position} rotation={[0.08, -0.22, -0.28]} scale={scale}>
        {/* Sculpted Beveled Gold Crescent Moon */}
        <mesh geometry={moonGeo} castShadow>
          <meshPhysicalMaterial
            color="#f5c542"
            metalness={0.94}
            roughness={0.16}
            clearcoat={0.7}
            clearcoatRoughness={0.12}
            emissive="#b45309"
            emissiveIntensity={0.16}
            envMapIntensity={1.6}
          />
        </mesh>

        {/* Companion 5-Pointed Gold Star */}
        <mesh ref={starRef} geometry={starGeo} position={[0.14, 0.04, 0.03]} castShadow>
          <meshPhysicalMaterial
            color="#fde047"
            metalness={0.92}
            roughness={0.14}
            clearcoat={0.75}
            clearcoatRoughness={0.1}
            emissive="#d97706"
            emissiveIntensity={0.28}
            envMapIntensity={1.7}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function IslamicStar3D({
  points = 8,
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = '#fbbf24',
  emissive = '#b45309',
}: {
  points?: 5 | 8;
  position?: [number, number, number];
  scale?: number;
  color?: string;
  emissive?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(
    () =>
      createStarGeometry(
        points,
        points === 8 ? 0.095 : 0.085,
        points === 8 ? 0.056 : 0.036,
        0.02
      ),
    [points]
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geo} position={position} scale={scale} castShadow>
      <meshPhysicalMaterial
        color={color}
        metalness={0.9}
        roughness={0.18}
        clearcoat={0.65}
        clearcoatRoughness={0.12}
        emissive={emissive}
        emissiveIntensity={0.25}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}
