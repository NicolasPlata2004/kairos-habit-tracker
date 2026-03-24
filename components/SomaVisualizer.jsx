/**
 * ARCHIVO: components/SomaVisualizer.jsx
 * PAPEL: Gemelo Digital Físico (SOMA).
 * DESCRIPCIÓN: Renderiza un "Maniquí de Ingeniería" usando primitivas 3D paramétricas
 * (Cilindros, Esferas) con React Three Fiber. El modelo reacciona visualmente escalando 
 * sus partes en función del % de grasa o las medidas ingresadas.
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

// Componente interno que define la malla del Maniquí Paramétrico
// NOTA: // INSERTAR MODELO BLENDER AQUÍ futuramente usando useGLTF() y morphTargetInfluences
const EngineeringMannequin = ({ bodyFat, age, gender }) => {
    const groupRef = useRef();

    // Animación idle suave (respiración / levitación)
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
        }
    });

    // Lógica paramétrica: Calculamos factores de escala basados en la grasa corporal.
    // bodyFat normal ronda ~15-20%. Usamos 15% como la base (escala 1).
    const fatScale = Math.max(0.8, 1 + (bodyFat - 15) * 0.015);
    const torsoScale = [fatScale, 1, fatScale * 0.9];
    const armScale = [1 + (fatScale - 1) * 0.3, 1, 1 + (fatScale - 1) * 0.3];
    const legScale = [1 + (fatScale - 1) * 0.5, 1, 1 + (fatScale - 1) * 0.5];

    // Material de alta tecnología (ingeniería)
    const materialParams = {
        color: '#4db8ff',
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9,
    };

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Cabeza */}
            <mesh position={[0, 1.8, 0]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>

            {/* Cuello */}
            <mesh position={[0, 1.55, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>

            {/* Torso (Este es el que más se ensancha con bodyFat) */}
            <mesh position={[0, 1, 0]} scale={torsoScale}>
                <cylinderGeometry args={[0.3, 0.25, 1, 32]} />
                <meshStandardMaterial {...materialParams} color="#2b8a3e" /> {/* Verde oscuro tecnológico */}
            </mesh>

            {/* Brazo Izquierdo */}
            <mesh position={[-0.45, 1, 0]} rotation={[0, 0, -0.1]} scale={armScale}>
                <cylinderGeometry args={[0.08, 0.06, 0.9, 16]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>

            {/* Brazo Derecho */}
            <mesh position={[0.45, 1, 0]} rotation={[0, 0, 0.1]} scale={armScale}>
                <cylinderGeometry args={[0.08, 0.06, 0.9, 16]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>

            {/* Pierna Izquierda */}
            <mesh position={[-0.15, 0.25, 0]} scale={legScale}>
                <cylinderGeometry args={[0.1, 0.08, 0.9, 16]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>

            {/* Pierna Derecha */}
            <mesh position={[0.15, 0.25, 0]} scale={legScale}>
                <cylinderGeometry args={[0.1, 0.08, 0.9, 16]} />
                <meshStandardMaterial {...materialParams} />
            </mesh>
        </group>
    );
};

// Contenedor principal del Canvas 3D
const SomaVisualizer = ({ measurements }) => {
    // Valores por defecto seguros
    const fat = measurements?.bodyFat || 15;
    const age = measurements?.age || 25;
    const gender = measurements?.gender || 'male';

    return (
        <div className="w-full h-96 md:h-[500px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-700">
            {/* Información HUD tipo Scifi */}
            <div className="absolute top-4 left-4 z-10 text-cyan-400 font-mono text-xs md:text-sm bg-black/50 p-3 rounded border border-cyan-900/50 backdrop-blur-sm">
                <p className="font-bold text-cyan-300 mb-1 tracking-widest uppercase">SOMA // Análisis</p>
                <p>GRASA CORP: <span className="text-white">{fat}%</span></p>
                <p>GÉNERO: <span className="text-white">{gender.toUpperCase()}</span></p>
                <p>STATUS: <span className="text-green-400">ÓPTIMO</span></p>
            </div>

            <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
                {/* Iluminación de estudio futurista */}
                <ambientLight intensity={0.5} />
                <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ffff" />
                
                <Environment preset="city" />

                <EngineeringMannequin bodyFat={fat} age={age} gender={gender} />

                {/* Sombra de contacto realista en el suelo */}
                <ContactShadows position={[0, -0.25, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#00e6ff" />

                {/* Controles para rotar el modelo */}
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    minPolarAngle={Math.PI / 4} 
                    maxPolarAngle={Math.PI / 2} 
                    autoRotate 
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default SomaVisualizer;
