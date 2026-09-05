import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from './StarField';

// Mouse position tracker with smoothing
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const animate = () => {
      setMousePosition(prev => ({
        x: prev.x + (targetPosition.current.x - prev.x) * 0.03,
        y: prev.y + (targetPosition.current.y - prev.y) * 0.03,
      }));
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return mousePosition;
}

// Cinematic camera with smooth parallax
function CameraRig({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePosition.x * 0.5, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mousePosition.y * 0.3, 0.02);
    camera.position.z = 8 + Math.sin(time * 0.1) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Elegant flowing aurora ribbons
function AuroraRibbon({ 
  color1, 
  color2, 
  position, 
  mousePosition 
}: { 
  color1: string; 
  color2: string; 
  position: [number, number, number];
  mousePosition: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { geometry, uniforms } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(12, 3, 128, 32);
    const uniforms = {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    return { geometry, uniforms };
  }, [color1, color2]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.3;
      materialRef.current.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0.2]}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform vec2 uMouse;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            float wave = sin(pos.x * 0.8 + uTime * 2.0) * 0.3;
            wave += sin(pos.x * 0.4 + uTime * 1.5) * 0.5;
            wave += cos(pos.x * 0.2 + uTime) * 0.3;
            
            pos.y += wave;
            pos.z += sin(pos.x * 0.3 + uTime) * 0.5;
            pos.x += uMouse.x * 0.5;
            pos.y += uMouse.y * 0.3;
            
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            float mixFactor = vUv.x + sin(uTime * 0.5) * 0.2;
            vec3 color = mix(uColor1, uColor2, mixFactor);
            
            float alpha = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            alpha *= 0.15 + abs(vWave) * 0.1;
            alpha *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Minimal floating particles
function FloatingDust({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      speeds[i] = 0.1 + Math.random() * 0.2;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, speeds, offsets };
  }, [count]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime * speeds[i] + offsets[i]) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.02}
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Elegant glowing orbs
function GlowOrb({ position, color, size = 0.3 }: { position: [number, number, number]; color: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.3;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      glowRef.current.scale.setScalar(scale * 3);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size * 0.3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Subtle grid floor
function SubtleGrid() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#6366f1') },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          
          void main() {
            vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
            float line = min(grid.x, grid.y);
            float gridAlpha = 1.0 - min(line, 1.0);
            
            float dist = length(vUv - 0.5);
            float fade = 1.0 - smoothstep(0.0, 0.5, dist);
            
            float alpha = gridAlpha * fade * 0.08;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Main scene
function Scene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
    <>
      <CameraRig mousePosition={mousePosition} />
      
      {/* Minimal lighting */}
      <ambientLight intensity={0.02} />
      
      {/* Aurora ribbons - elegant flowing light */}
      <AuroraRibbon 
        color1="#6366f1" 
        color2="#a855f7" 
        position={[0, 2, -5]} 
        mousePosition={mousePosition} 
      />
      <AuroraRibbon 
        color1="#ec4899" 
        color2="#f97316" 
        position={[0, -1, -7]} 
        mousePosition={mousePosition} 
      />
      <AuroraRibbon 
        color1="#06b6d4" 
        color2="#6366f1" 
        position={[0, 0, -9]} 
        mousePosition={mousePosition} 
      />
      
      {/* Subtle glowing orbs */}
      <GlowOrb position={[-5, 2, -4]} color="#6366f1" size={0.2} />
      <GlowOrb position={[5, -1, -5]} color="#ec4899" size={0.15} />
      <GlowOrb position={[-3, -2, -6]} color="#a855f7" size={0.18} />
      <GlowOrb position={[4, 1, -3]} color="#06b6d4" size={0.12} />
      <GlowOrb position={[0, 3, -8]} color="#f472b6" size={0.2} />
      
      {/* Floating dust particles */}
      <FloatingDust count={80} />
      
      {/* Subtle grid */}
      <SubtleGrid />
    </>
  );
}

export default function Background3D() {
  const mousePosition = useMousePosition();

  return (
    <div className="fixed inset-0 -z-10">
      {/* Light gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 20% 80%, rgba(139, 92, 246, 0.07) 0%, transparent 50%),
            linear-gradient(180deg, #f8f9fc 0%, #f0f2f8 50%, #e8eaf2 100%)
          `,
        }}
      />
      
      {/* Cinematic Star Field with Shooting Stars - disabled for light theme */}
      {/* <StarField count={180} /> */}
      
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
      >
        <Scene mousePosition={mousePosition} />
      </Canvas>
      
      {/* Subtle vignette overlay for light theme */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)',
        }}
      />
    </div>
  );
}
