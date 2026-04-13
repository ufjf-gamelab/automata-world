import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Floor from "./game/world/Floor";
import Player from "./game/player/Player";
import VictoryModal from "./game/ui/VictoryModal";
import CompassRose from "./CompassRose";
import { stagesList } from "./game/data/Stages";
import type { Stage } from "./game/data/types";
import type { GameState } from "./game/gameReducer";
import styles from "./GameView.module.css";

// Lê o azimute da câmera a cada frame e atualiza o grupo SVG da rosa diretamente,
// sem disparar re-renders do React.
function CameraWatcher({ compassRef }: { compassRef: React.RefObject<SVGGElement | null> }) {
    useFrame(({ camera }) => {
        if (!compassRef.current) return;
        // Azimute horizontal da câmera no plano XZ (em graus)
        const azimuth = Math.atan2(camera.position.x, camera.position.z) * (180 / Math.PI);
        compassRef.current.setAttribute("transform", `rotate(${azimuth}, 40, 40)`);
    });
    return null;
}

interface GameViewProps {
    gameState: GameState;
    currentCommand: string;
    onChangeStage: (stage: Stage) => void;
    onNextStage: () => void;
}

export default function GameView({
    gameState,
    currentCommand,
    onChangeStage,
    onNextStage,
}: GameViewProps) {
    const {
        activeStage,
        activeButtons,
        playerGridPos,
        playerRotation,
        blockHeight,
        isVictory,
        stepCounter,
    } = gameState;

    const compassInnerRef = useRef<SVGGElement | null>(null);
    const [visualX, visualZ] = getVisualPosition(playerGridPos, activeStage.floor);

    return (
        <div className={styles.gameView}>
            <VictoryModal isOpen={isVictory} onNextStage={onNextStage} />

            <div className={styles.stageBar}>
                {stagesList.map((stage) => (
                    <button
                        key={stage.id}
                        className={activeStage.id === stage.id ? styles.active : ""}
                        onClick={() => onChangeStage(stage)}
                    >
                        {stage.name}
                    </button>
                ))}
            </div>

            <div className={styles.canvasFrame}>
                <Canvas key={activeStage.id} shadows camera={{ position: [8, 8, 8], fov: 50 }}>
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow />
                    <pointLight position={[-10, -5, -10]} intensity={0.2} />

                    <group position={[0, 0, 0]}>
                        <Floor grid={activeStage.floor} activeButtons={activeButtons} />
                        <Player
                            gridPosition={[visualX, visualZ]}
                            rotationIndex={playerRotation}
                            blockHeight={blockHeight}
                            stepIndex={stepCounter}
                            command={currentCommand}
                        />
                    </group>

                    <OrbitControls enablePan={false} enableZoom={false} />
                    <CameraWatcher compassRef={compassInnerRef} />
                </Canvas>

                <CompassRose rotationIndex={playerRotation} innerRef={compassInnerRef} />
            </div>
        </div>
    );
}

const getVisualPosition = (gridPos: [number, number], floorString: string) => {
    const mapRows = floorString.trim().split("\n");
    const mapWidth = Math.max(...mapRows.map((r) => r.length));
    const mapDepth = mapRows.length;
    const x = gridPos[0] - mapWidth / 2 + 0.5;
    const z = gridPos[1] - mapDepth / 2 + 0.5;
    return [x, z] as [number, number];
};
