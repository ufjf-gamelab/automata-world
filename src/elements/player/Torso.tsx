export default function Torso({ position }: { position: [number, number, number] }) {
    return (
        <mesh position={position}>
            <boxGeometry args={[0.7, 1.0, 0.35]} />
            <meshStandardMaterial metalness={0.1} roughness={0.7} />
        </mesh>
    );
}
