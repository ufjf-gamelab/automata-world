import { Cone, Cylinder } from "@react-three/drei";
import type { MapObjectProps } from "./Types";

export default function Tree({ position }: MapObjectProps) {
    const trunkHeight = 0.8;
    const leavesHeight = 1.2;
    return (
        <group position={position}>
            <Cylinder args={[0.1, 0.15, trunkHeight, 8]} position={[0, trunkHeight / 2, 0]} castShadow>
                <meshStandardMaterial color="#663300" />
            </Cylinder>
            <Cone args={[0.6, leavesHeight, 8]} position={[0, trunkHeight + leavesHeight / 2, 0]} castShadow>
                <meshStandardMaterial color="#006400" />
            </Cone>
        </group>
    );
}