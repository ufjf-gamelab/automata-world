import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Cylinder, Sphere } from "@react-three/drei";
import { Color, FogExp2, DoubleSide } from "three";

/** Aplica cor de fundo e neblina exponencial à cena Three.js */
function SceneSetup() {
    const { scene } = useThree();

    useEffect(() => {
        scene.background = new Color("#87ceeb"); // azul céu
        scene.fog = new FogExp2("#b0d8f0", 0.015);
        return () => {
            scene.background = null;
            scene.fog = null;
        };
    }, [scene]);

    return null;
}

/** Chão plano de grama que se estende além do mapa */
function GroundPlane() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#4a7c59" side={DoubleSide} />
        </mesh>
    );
}

/** Árvore simples: tronco + copa */
function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
    return (
        <group position={[x, -0.5, z]} scale={scale}>
            {/* Tronco */}
            <Cylinder args={[0.12, 0.18, 0.9, 6]} position={[0, 0.45, 0]} castShadow>
                <meshStandardMaterial color="#5c3d1e" />
            </Cylinder>
            {/* Copa inferior */}
            <Cylinder args={[0, 0.75, 1.2, 7]} position={[0, 1.2, 0]} castShadow>
                <meshStandardMaterial color="#2d6a2d" />
            </Cylinder>
            {/* Copa superior */}
            <Cylinder args={[0, 0.55, 0.9, 7]} position={[0, 1.9, 0]} castShadow>
                <meshStandardMaterial color="#3a8a3a" />
            </Cylinder>
        </group>
    );
}

/** Nuvem: conjunto de esferas sobrepostas */
function Cloud({ x, y, z }: { x: number; y: number; z: number }) {
    return (
        <group position={[x, y, z]}>
            <Sphere args={[0.9, 8, 6]} position={[0, 0, 0]}>
                <meshStandardMaterial color="white" transparent opacity={0.88} />
            </Sphere>
            <Sphere args={[0.65, 8, 6]} position={[1.1, -0.1, 0]}>
                <meshStandardMaterial color="white" transparent opacity={0.88} />
            </Sphere>
            <Sphere args={[0.55, 8, 6]} position={[-1.0, -0.15, 0]}>
                <meshStandardMaterial color="white" transparent opacity={0.88} />
            </Sphere>
            <Sphere args={[0.45, 8, 6]} position={[0.5, 0.45, 0]}>
                <meshStandardMaterial color="white" transparent opacity={0.88} />
            </Sphere>
        </group>
    );
}

// /** Nuvens que se movem lentamente */
function MovingClouds() {
    const groupRef = useRef<any>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.position.x += delta * 0.4;
            // Reinicia quando sai do campo de visão
            if (groupRef.current.position.x > 30) {
                groupRef.current.position.x = -30;
            }
        }
    });

    return (
        <group ref={groupRef}>
            <Cloud x={-8} y={9} z={-12} />
            <Cloud x={5} y={11} z={-18} />
            <Cloud x={14} y={8} z={-10} />
            <Cloud x={-2} y={13} z={-22} />
        </group>
    );
}

/** Posições das árvores ao redor do mapa */
const TREE_POSITIONS: Array<[number, number]> = [
    [-12, -10],
    [-14, -4],
    [-13, 3],
    [-11, 9],
    [-15, 14],
    [12, -10],
    [14, -4],
    [13, 3],
    [11, 9],
    [15, 14],
    [-6, -14],
    [0, -15],
    [6, -14],
    [-6, 16],
    [0, 17],
    [6, 16],
    [-18, 0],
    [18, 0],
    [-17, 18],
    [17, -18],
];

export default function GameEnvironment() {
    return (
        <>
            <SceneSetup />
            <GroundPlane />
            <MovingClouds />
            {TREE_POSITIONS.map(([x, z], i) => (
                <Tree key={i} x={x} z={z} scale={0.8 + (i % 3) * 0.2} />
            ))}
        </>
    );
}
