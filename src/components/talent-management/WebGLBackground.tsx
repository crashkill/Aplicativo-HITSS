import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedPointsProps {
  count?: number;
}

const AnimatedPoints: React.FC<AnimatedPointsProps> = ({ count = 5000 }) => {
  const ref = useRef<THREE.Points>(null!);
  
  // Gerar posições aleatórias dos pontos
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Posições em uma esfera
      const radius = Math.random() * 20 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Cores variando entre azul e roxo
      const colorIntensity = Math.random() * 0.5 + 0.5;
      colors[i * 3] = colorIntensity * 0.4; // R
      colors[i * 3 + 1] = colorIntensity * 0.6; // G
      colors[i * 3 + 2] = colorIntensity; // B
    }
    
    return [positions, colors];
  }, [count]);

  // Animação de rotação
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

interface FloatingGeometryProps {
  position: [number, number, number];
  geometry: 'box' | 'sphere' | 'torus';
  color: string;
  speed?: number;
}

const FloatingGeometry: React.FC<FloatingGeometryProps> = ({ 
  position, 
  geometry, 
  color, 
  speed = 1 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 0.5;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.01;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
      case 'sphere':
        return <sphereGeometry args={[0.3, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.3, 0.1, 16, 100]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {renderGeometry()}
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

const Scene: React.FC = () => {
  // Geometrias flutuantes
  const geometries = useMemo(() => [
    { position: [-5, 2, -2] as [number, number, number], geometry: 'box' as const, color: '#4F46E5', speed: 0.5 },
    { position: [5, -2, -3] as [number, number, number], geometry: 'sphere' as const, color: '#7C3AED', speed: 0.8 },
    { position: [-3, -3, 2] as [number, number, number], geometry: 'torus' as const, color: '#2563EB', speed: 0.3 },
    { position: [3, 3, 1] as [number, number, number], geometry: 'box' as const, color: '#8B5CF6', speed: 0.6 },
    { position: [0, -1, -4] as [number, number, number], geometry: 'sphere' as const, color: '#1D4ED8', speed: 0.4 },
  ], []);

  return (
    <>
      {/* Luz ambiente */}
      <ambientLight intensity={0.5} />
      
      {/* Luz direcional */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Pontos animados */}
      <AnimatedPoints count={3000} />
      
      {/* Geometrias flutuantes */}
      {geometries.map((geo, index) => (
        <FloatingGeometry
          key={index}
          position={geo.position}
          geometry={geo.geometry}
          color={geo.color}
          speed={geo.speed}
        />
      ))}
    </>
  );
};

interface WebGLBackgroundProps {
  className?: string;
}

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ 
          position: [0, 0, 10], 
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Scene />
      </Canvas>
      
      {/* Overlay gradient para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-indigo-950/60 to-slate-950/80" />
    </div>
  );
};

export default WebGLBackground; 