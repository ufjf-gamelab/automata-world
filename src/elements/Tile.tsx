import { RoundedBox } from "@react-three/drei";
import type { TileProps } from "./Types";

export default function Tile({ position, height, isButton = false, isActive = false }: TileProps) {
    const tiles = [];
    if (height <= 0) return null;

    for (let i = 0; i < height; i++) {
        const isTopBox = i === height - 1;

        tiles.push(
            <RoundedBox
                key={i}
                position={[position[0], position[1] + i * 0.5, position[2]]}
                args={[1, 0.5, 1]}
                radius={0.03}
                smoothness={1}
                receiveShadow
                castShadow
            >
                {isTopBox && isActive ? (
                    isButton ? (
                        <meshStandardMaterial
                            color="hsla(211, 61%, 59%, 1.00)"
                            emissive={"yellow"}
                            emissiveIntensity={0.75}
                        />
                    ) : (
                        <meshStandardMaterial
                            color="hsla(211, 61%, 59%, 1.00)"
                            emissive={"hsla(211, 61%, 39%, 1.00)"}
                            emissiveIntensity={0.75}
                        />
                    )
                ) : (
                    <meshStandardMaterial
                        color={
                            isTopBox && isButton
                                ? "hsla(211, 61%, 39%, 1.00)"
                                : "hsla(211, 61%, 59%, 1.00)"
                        }
                    />
                )}
            </RoundedBox>
        );
    }

    return <group>{tiles}</group>;
}
