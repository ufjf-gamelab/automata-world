export default function Cabeca({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.28, 32, 32]} />
                <meshStandardMaterial metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[-0.08, 0.04, 0.25]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color={"#111"} />
            </mesh>
            <mesh position={[0.08, 0.04, 0.25]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color={"#111"} />
            </mesh>
        </group>
    );
}