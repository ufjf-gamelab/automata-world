export default function Braco({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, -0.25, 0]}>
                <boxGeometry args={[0.18, 0.5, 0.18]} />
                <meshStandardMaterial />
            </mesh>
            <mesh position={[0, -0.75, 0]}>
                <boxGeometry args={[0.16, 0.45, 0.16]} />
                <meshStandardMaterial />
            </mesh>
            <mesh position={[0, -1.0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial />
            </mesh>
        </group>
    );
}