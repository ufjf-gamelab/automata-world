import { useReducer } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Floor from "./game/Floor";
import Player from "./game/Player";
import VictoryModal from "./game/VictoryModal";
import { stagesList } from "./game/Stages";
import { gameReducer, createInitialState } from "./game/gameReducer";
import type { Stage } from "./game/types";
import styles from "./GameView.module.css";

interface GameViewProps {
    externalCommand?: string;
}

export default function GameView({ externalCommand = "" }: GameViewProps) {
    const [state, dispatch] = useReducer(gameReducer, stagesList[0], createInitialState);

    const {
        activeStage,
        activeButtons,
        playerGridPos,
        playerRotation,
        blockHeight,
        isVictory,
        commandIndex,
    } = state;

    const handleChangeStage = (stage: Stage) => {
        dispatch({ type: "RESET_STAGE", payload: { stage, commands: "" } });
    };

    const handleNextStage = () => {
        const currentIndex = stagesList.findIndex((s) => s.id === activeStage.id);
        const nextStage = stagesList[currentIndex + 1] || stagesList[0];
        dispatch({ type: "RESET_STAGE", payload: { stage: nextStage, commands: "" } });
    };

    const [visualX, visualZ] = getVisualPosition(playerGridPos, activeStage.floor);

    return (
        <div className={styles.gameView}>
            <VictoryModal isOpen={isVictory} onNextStage={handleNextStage} />

            <div className={styles.stageBar}>
                {stagesList.map((stage) => (
                    <button
                        key={stage.id}
                        className={activeStage.id === stage.id ? styles.active : ""}
                        onClick={() => handleChangeStage(stage)}
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
                            stepIndex={commandIndex}
                            command={externalCommand}
                        />
                    </group>

                    <OrbitControls enablePan={false} enableZoom={false} />
                </Canvas>
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