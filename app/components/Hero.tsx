"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GlobeWithPlane() {
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);

  // Animate the plane orbiting the globe
  useRef(() => {
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      angle += 0.01;
      if (planeRef.current) {
        planeRef.current.position.x = 2.5 * Math.cos(angle);
        planeRef.current.position.z = 2.5 * Math.sin(angle);
        planeRef.current.rotation.y = -angle;
      }
    };
    animate();
  }, []);

  return (
    <group ref={groupRef}>
      {/* Globe */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={new THREE.TextureLoader().load("/assets/globe-texture.jpg")}
          metalness={0.4}
          roughness={0.8}
        />
      </mesh>

      {/* Airplane */}
      <mesh ref={planeRef}>
        <coneGeometry args={[0.1, 0.4, 8]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
}

export default function Hero() {
  return (
    <div className="hero min-h-[80vh] bg-gradient-to-r from-purple-600 to-purple-800 relative overflow-hidden flex items-center justify-center px-6 sm:px-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* Left: 3D Globe */}
        <div className="h-72 sm:h-96 lg:h-[28rem] w-full">
          <Canvas camera={{ position: [0, 0, 6] }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 2, 5]} intensity={1.2} />
            <Stars radius={50} depth={20} count={4000} factor={4} fade />
            <GlobeWithPlane />
            <OrbitControls
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Right: Agency Text */}
        <div className="text-white text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            SSL Recruitment Agency
          </h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90">
            We are a premier international recruitment agency dedicated to
            bridging the gap between exceptional global talent and the world’s
            leading organizations. Our mission is to connect people and
            opportunities across borders — making dreams take flight.
          </p>
        </div>
      </div>
    </div>
  );
}
