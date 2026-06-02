import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// 1. Procedural Canvas Texture Generator for Earth Grid & Continents
const createEarthTexture = (accent) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep space base ocean color
  ctx.fillStyle = '#06080d';
  ctx.fillRect(0, 0, 1024, 512);

  // Draw futuristic grid scanning lines
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
  ctx.lineWidth = 1;

  // Latitude lines
  for (let i = 0; i <= 18; i++) {
    const y = (i / 18) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Longitude lines
  for (let i = 0; i <= 36; i++) {
    const x = (i / 36) * 1024;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Draw glowing continental outlines procedurally
  ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8;

  // Helper to draw continent coordinates
  const drawContinent = (points) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Simplified continent vector coordinates mapped onto a 1024x512 plane
  // Eurasia / Africa
  drawContinent([
    [450, 80], [530, 70], [600, 60], [700, 70], [800, 80], [850, 120], [820, 200], 
    [750, 220], [680, 280], [620, 260], [570, 320], [520, 420], [480, 420], [470, 320],
    [380, 300], [360, 220], [350, 150], [400, 120]
  ]);

  // North & South Americas
  drawContinent([
    [150, 80], [220, 90], [280, 110], [250, 180], [290, 240], [260, 270], [280, 340],
    [320, 420], [300, 460], [260, 460], [220, 360], [200, 270], [170, 250], [140, 180]
  ]);

  // Australia / Oceania
  drawContinent([
    [760, 340], [820, 330], [850, 370], [810, 410], [740, 380]
  ]);

  // Antarctica
  drawContinent([
    [100, 490], [900, 490], [800, 505], [200, 505]
  ]);

  // Reset shadow to conserve GPU cycles
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

// 2. Procedural Canvas Texture Generator for Atmospheric Vapor Clouds
const createCloudTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 256);

  // Draw soft cloud shapes using smooth radial gradients
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 45 + 15;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
};

// Mesh rendering stacks
const EarthMesh = ({ latitude, longitude, accent }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  
  // Memoize procedural textures to prevent recreation overhead during frame renders
  const [earthMap, cloudMap] = useMemo(() => {
    return [
      createEarthTexture(accent),
      createCloudTexture()
    ];
  }, [accent]);

  // Rotational frame increments
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsed * 0.035;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsed * 0.045;
      cloudsRef.current.rotation.x = Math.sin(elapsed * 0.01) * 0.03;
    }
  });

  // Spherical Coordinates mapping to 3D Cartesian coordinates (Pin locator)
  const getCoordinates3D = (lat, lon, radius = 2.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return [x, y, z];
  };

  const pinPosition = getCoordinates3D(latitude, longitude);

  return (
    <group>
      {/* 1. Core Holographic Grid Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          map={earthMap}
          roughness={0.5}
          metalness={0.2}
          emissive={new THREE.Color('#1e1b4b')}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 2. Slow Orbiting Atmospheric Vapor Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 48, 48]} />
        <meshStandardMaterial
          alphaMap={cloudMap}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
          color="#f1f5f9"
        />
      </mesh>

      {/* 3. Spherical Locator coordinate pin */}
      {latitude !== undefined && longitude !== undefined && (
        <group position={pinPosition}>
          {/* Pulsing core node */}
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial 
              color={accent} 
              transparent 
              opacity={0.8} 
              depthWrite={false}
            />
          </mesh>
          {/* Sub-halo ring */}
          <mesh scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial 
              color={accent} 
              wireframe 
              transparent 
              opacity={0.35} 
              depthWrite={false}
            />
          </mesh>
          {/* Signal beacon cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.25, 6]} />
            <meshBasicMaterial color={accent} transparent opacity={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Main Earth Globe Canvas wrapper
const EarthGlobe3D = ({ latitude = 0, longitude = 0, theme }) => {
  return (
    <div className="relative w-full h-[320px] md:h-[400px] rounded-3xl overflow-hidden bg-black/45 border border-white/5 shadow-2xl flex items-center justify-center">
      {/* Visual Header Grid Tags */}
      <div className="absolute top-4 left-4 z-10 text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
        <span>3D WEATHER SYSTEMS GLOBE</span>
      </div>

      <div className="absolute top-4 right-4 z-10 text-[9px] font-mono text-slate-500 tracking-wider">
        LAT: <span className="text-slate-300 font-semibold">{latitude.toFixed(2)}</span> // LON: <span className="text-slate-300 font-semibold">{longitude.toFixed(2)}</span>
      </div>

      {/* 3D Canvas Rendering Stack */}
      <Canvas
        camera={{ position: [0, 0, 4.4], fof: 65 }}
        gl={{ antialias: false, alpha: true }} // Disabled antialiasing for maximum mobile FPS
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} color="#ffffff" />
        
        {/* Soft atmospheric blue backing light */}
        <directionalLight 
          position={[-5, 3, -5]} 
          intensity={1.0} 
          color="#312e81" 
        />
        
        {/* Direct Solar light source */}
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={3.2} 
          color="#e0e7ff" 
        />

        {/* Ambient space starfield */}
        <Stars 
          radius={120} 
          depth={50} 
          count={600} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={0.8} 
        />

        <EarthMesh 
          latitude={latitude} 
          longitude={longitude} 
          accent={theme.accent} 
        />

        {/* Orbit drag inertia controller */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate={false}
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default EarthGlobe3D;
