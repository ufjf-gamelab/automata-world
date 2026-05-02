import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Floor from "./game/world/Floor";
import Player from "./game/player/Player";
import GameEnvironment from "./game/world/GameEnvironment";
import VictoryModal from "./game/ui/VictoryModal";
import TutorialModal from "./game/ui/TutorialModal";
import CompassRose from "./CompassRose";
import StageSelector from "./game/ui/StageSelector";
import type { Stage } from "./game/data/types";
import type { GameState } from "./game/gameReducer";
import styles from "./GameView.module.css";

function CameraWatcher({ compassRef }: { compassRef: React.RefObject<SVGGElement | null> }) {
    useFrame(({ camera }) => {
        if (!compassRef.current) return;
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
    customStages: Stage[];
    onSaveCustomStage: (stage: Stage) => void;
    onDeleteCustomStage: (id: number) => void;
}

export default function GameView({
    gameState,
    currentCommand,
    onChangeStage,
    onNextStage,
    customStages,
    onSaveCustomStage,
    onDeleteCustomStage,
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

    const [showTutorial, setShowTutorial] = useState(() =>
        Boolean(activeStage.tutorial && activeStage.tutorial.length > 0),
    );

    useEffect(() => {
        setShowTutorial(Boolean(activeStage.tutorial && activeStage.tutorial.length > 0));
    }, [activeStage.id]);

    return (
        <div className={styles.gameView}>
            <VictoryModal isOpen={isVictory} onNextStage={onNextStage} />

            {showTutorial && activeStage.tutorial && (
                <TutorialModal
                    steps={activeStage.tutorial}
                    stageName={activeStage.name}
                    onClose={() => setShowTutorial(false)}
                />
            )}

            <div className={styles.stageBar}>
                <StageSelector
                    activeStage={activeStage}
                    onChangeStage={onChangeStage}
                    customStages={customStages}
                    onSaveCustomStage={onSaveCustomStage}
                    onDeleteCustomStage={onDeleteCustomStage}
                />
            </div>

            <div className={styles.canvasFrame}>
                <Canvas key={activeStage.id} shadows camera={{ position: [8, 8, 8], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
                    <pointLight position={[-10, -5, -10]} intensity={0.15} />

                    <GameEnvironment />

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
