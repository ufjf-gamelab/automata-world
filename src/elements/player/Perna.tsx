export default function Perna({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[0.2, 0.7, 0.2]} />
                <meshStandardMaterial />
            </mesh>
            <mesh position={[0, -1.0, 0]}>
                <boxGeometry args={[0.18, 0.6, 0.18]} />
                <meshStandardMaterial />
            </mesh>
            <mesh position={[0, -1.3, 0]}>
                <boxGeometry args={[0.3, 0.12, 0.5]} />
                <meshStandardMaterial />
            </mesh>
        </group>
    );
}