import Tile from "./Tile";
import type { FloorProps } from "./Types";

export default function Floor({ grid, activeButtons = [] }: FloorProps) {
    const rows = grid.trim().split("\n");

    const maxWidth = Math.max(...rows.map((r) => r.length));
    const maxHeight = rows.length;

    const tiles = [];

    for (let z = 0; z < rows.length; z++) {
        const row = rows[z].split("");
        for (let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char === " ") continue;

            let rawValue = parseInt(char);

            // Botão: > 5 ou 0
            const isButton = rawValue > 5 || rawValue === 0;

            let height = rawValue;
            if (isButton) {
                height = rawValue === 0 ? 5 : rawValue - 5;
            }

            const tileKey = `${x}-${z}`;
            const isActive = activeButtons.includes(tileKey);

            //maxWidth e maxHeight fixos para todo o mapa
            const offsetX = maxWidth / 2;
            const offsetZ = maxHeight / 2;

            const posX = x - offsetX + 0.5;
            const posZ = z - offsetZ + 0.5;
            const posY = -0.5;

            tiles.push(
                <Tile
                    key={tileKey}
                    position={[posX, posY, posZ]}
                    height={height}
                    isButton={isButton}
                    isActive={isActive}
                />
            );
        }
    }

    return <group>{tiles}</group>;
}
