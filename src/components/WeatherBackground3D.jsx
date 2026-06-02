import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Point-Based Atmospheric Weather Particles
const ParticleSystem = ({ theme }) => {
  const pointsRef = useRef();
  const { particleCount, particleSpeed, particleColor, particleType } = theme;

  // Initialize random particle coordinate buffers
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;      // X coordinate
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;  // Y coordinate
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;  // Z coordinate

      if (particleType === 'rain') {
        vel[i * 3 + 1] = -Math.random() * 0.15 - 0.15; // Vertical fall
        vel[i * 3] = (Math.random() - 0.5) * 0.01;      // Wind drift
      } else if (particleType === 'snow') {
        vel[i * 3 + 1] = -Math.random() * 0.03 - 0.01; // Soft drift
        vel[i * 3] = (Math.random() - 0.5) * 0.015;     // Swaying
      } else if (particleType === 'storm') {
        vel[i * 3 + 1] = -Math.random() * 0.22 - 0.18; // Driving storm rain
        vel[i * 3] = -0.035;                            // Angled wind
      } else {
        // Star or solar specks (lazy rise)
        vel[i * 3 + 1] = Math.random() * 0.006 + 0.002;
        vel[i * 3] = (Math.random() - 0.5) * 0.003;
      }
    }
    return [pos, vel];
  }, [particleCount, particleType]);

  // Frame animations
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const points = pointsRef.current;
    const posArr = points.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];

      // Add sinusoidal sway for snow crystals
      if (particleType === 'snow') {
        posArr[i * 3] += Math.sin(time * 0.8 + i) * 0.004;
      }

      // Vertical wrapping boundaries
      if (particleType === 'rain' || particleType === 'snow' || particleType === 'storm') {
        if (posArr[i * 3 + 1] < -7) {
          posArr[i * 3 + 1] = 7;
          posArr[i * 3] = (Math.random() - 0.5) * 15;
        }
      } else {
        // Stars/Sun rise upwards
        if (posArr[i * 3 + 1] > 7) {
          posArr[i * 3 + 1] = -7;
          posArr[i * 3] = (Math.random() - 0.5) * 15;
        }
      }
      
      // X-axis wrap boundaries
      if (posArr[i * 3] < -7.5) posArr[i * 3] = 7.5;
      if (posArr[i * 3] > 7.5) posArr[i * 3] = -7.5;
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={particleType === 'rain' || particleType === 'storm' ? 0.045 : 0.08}
        transparent={true}
        opacity={particleType === 'rain' || particleType === 'storm' ? 0.45 : 0.75}
        sizeWrite={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 2. Dynamic 3D Geometric Figures & Climatic Meshes
const SingleFloatingFigure = ({ type, accent, speedMultiplier, index }) => {
  const meshRef = useRef();

  // Generate randomized drift paths, scale, and orbital properties
  const [posX, posY, posZ, scale, spinSpeed] = useMemo(() => {
    return [
      (Math.random() - 0.5) * 12, // X grid dispersion
      (Math.random() - 0.5) * 10, // Y grid dispersion
      -Math.random() * 4 - 2,     // Z depth layering (-2 to -6)
      Math.random() * 0.4 + 0.2,  // Random scaling
      (Math.random() - 0.5) * 0.4 // Rotational speed factor
    ];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const elapsed = clock.getElapsedTime();

    // 1. Orbital sway movements (simulating floating weightlessness)
    mesh.position.y = posY + Math.sin(elapsed * 0.5 * speedMultiplier + index) * 0.6;
    mesh.position.x = posX + Math.cos(elapsed * 0.3 * speedMultiplier + index) * 0.4;

    // 2. Rotational spin over frames
    mesh.rotation.y = elapsed * 0.2 * spinSpeed;
    mesh.rotation.x = elapsed * 0.15 * spinSpeed;
    mesh.rotation.z = elapsed * 0.1 * spinSpeed;
  });

  return (
    <mesh ref={meshRef} position={[posX, posY, posZ]} scale={[scale, scale, scale]}>
      {getGeometryForWeather(type)}
      <meshBasicMaterial
        color={accent}
        wireframe={true}
        transparent={true}
        opacity={0.16}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Mapped geometric shapes corresponding to active weather categories
const getGeometryForWeather = (weatherType) => {
  switch (weatherType) {
    case 'rain':
      // Cones (resembling teardrop dynamics)
      return <coneGeometry args={[0.6, 1.2, 4]} />;
    case 'snow':
      // Icosahedrons (perfectly mapping microscopic snowflake crystal lattices)
      return <icosahedronGeometry args={[0.7, 1]} />;
    case 'storm':
      // Tetrahedrons (sharp pyramids to reflect lightning dynamics)
      return <tetrahedronGeometry args={[0.8, 0]} />;
    case 'fog':
      // Dodecahedrons (silver puffy structures representing dense fog puffs)
      return <dodecahedronGeometry args={[0.9, 0]} />;
    case 'star':
      // Starry Space Rings (planetary loops)
      return <torusGeometry args={[0.8, 0.1, 8, 24]} />;
    default:
      // Octahedrons & Toruses (Solar halos)
      return Math.random() > 0.5 ? 
        <octahedronGeometry args={[0.7, 0]} /> : 
        <torusGeometry args={[0.7, 0.08, 8, 16]} />;
  }
};

// Drifter container maintaining 7 floating shapes
const FloatingFigures = ({ theme }) => {
  const figuresArray = useMemo(() => Array.from({ length: 7 }), []);

  return (
    <group>
      {figuresArray.map((_, i) => (
        <SingleFloatingFigure
          key={i}
          index={i}
          type={theme.particleType}
          accent={theme.accent}
          speedMultiplier={theme.particleSpeed > 5 ? 2.5 : 1.0}
        />
      ))}
    </group>
  );
};

// 3. Stormy Lightning Flash System
const LightningFlashes = ({ active }) => {
  const lightRef = useRef();

  useFrame(() => {
    if (!lightRef.current || !active) return;
    
    // Random high-tension electrical discharges
    if (Math.random() > 0.985) {
      lightRef.current.intensity = 15.0; // Flash surge
    } else {
      lightRef.current.intensity *= 0.80; // Fast decay rate
    }
  });

  return (
    <ambientLight 
      ref={lightRef} 
      intensity={0} 
      color="#e9d5ff" 
    />
  );
};

// Core Canvas Wrapper
const WeatherBackground3D = ({ theme }) => {
  const isStorm = theme.particleType === 'storm';

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-20 select-none bg-transparent">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false }} // Disabled antialiasing for maximum mobile frames
      >
        <ambientLight intensity={0.45} />
        
        {/* Render particle points */}
        <ParticleSystem theme={theme} />
        
        {/* Render newly added floating 3D figures and geometries */}
        <FloatingFigures theme={theme} />
        
        {/* Render electric lightning flashes for storm atmospheres */}
        <LightningFlashes active={isStorm} />
      </Canvas>
    </div>
  );
};

export default WeatherBackground3D;
