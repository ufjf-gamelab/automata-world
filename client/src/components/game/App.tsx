import { useReducer } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Floor from "./elements/Floor";
import Player from "./elements/Player";
import CommandTape from "./elements/CommandTape";
import VictoryModal from "./elements/VictoryModal";
import { stagesList } from "./elements/Stages";
import { gameReducer, createInitialState } from "./gameReducer";
import type { Stage } from "./elements/playerTypes";
import "./App.css";

export default function App() {

    const [state, dispatch] = useReducer(gameReducer, stagesList[0], createInitialState);

    const {
        activeStage,
        activeButtons,
        playerGridPos,
        playerRotation,
        blockHeight,
        isVictory,
        commands,
        commandIndex,
        isExecuting,
    } = state;

    const executeStep = async () => {
        if (isExecuting) return;
        if (commandIndex >= commands.length) return;

        // Bloqueia a UI
        dispatch({ type: "START_EXECUTION" });

        // Calcula o próximo estado lógico
        dispatch({ type: "NEXT_STEP" });

        // Libera a UI
        dispatch({ type: "STOP_EXECUTION" });
    };

    // Da atualização da fita de comandos
    const handleCommandsUpdate = (newCommands: string) => {
        dispatch({ type: "UPDATE_COMMANDS", payload: newCommands });
    };

    // A payload aqui serve para mostrar como que eu quero que a fase reinicie
    const handleChangeStage = (stage: Stage) => {
        dispatch({ type: "RESET_STAGE", payload: { stage, commands: "" } });
    };

    const handleManualReset = () => {
        dispatch({ type: "RESET_STAGE", payload: { commands: "" } });
    };

    const handleRetry = () => {
        dispatch({ type: "RESET_STAGE" });
    };

    const handleNextStage = () => {
        const currentIndex = stagesList.findIndex((s) => s.id === activeStage.id);
        const nextStage = stagesList[currentIndex + 1] || stagesList[0];
        dispatch({ type: "RESET_STAGE", payload: { stage: nextStage, commands: "" } });
    };

    const [visualX, visualZ] = getVisualPosition(playerGridPos, activeStage.floor);

    const currentCommand = commandIndex > 0 ? commands[commandIndex - 1] : "";

    return (
        <div className="main-container">
            <VictoryModal isOpen={isVictory} onNextStage={handleNextStage} />

            <div className="sidebar-container">
                <div className="menu-container">
                    <h2>Selecione a Fase</h2>
                    <div className="button-group">
                        {stagesList.map((stage) => (
                            <button
                                key={stage.id}
                                className={activeStage.id === stage.id ? "active" : ""}
                                onClick={() => handleChangeStage(stage)}
                                disabled={isExecuting}
                            >
                                {stage.name}
                            </button>
                        ))}
                    </div>
                </div>

                <CommandTape
                    commands={commands}
                    commandIndex={commandIndex}
                    isExecuting={isExecuting}
                    onInputChange={handleCommandsUpdate}
                    onExecuteStep={executeStep}
                    onReset={handleManualReset}
                    onRetry={handleRetry}
                />
            </div>

            <div className="canvas-frame">
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
                            command={currentCommand}
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

    // Centraliza o grid (0,0 fica no meio do mapa)
    const x = gridPos[0] - mapWidth / 2 + 0.5;
    const z = gridPos[1] - mapDepth / 2 + 0.5;

    return [x, z] as [number, number];
};
