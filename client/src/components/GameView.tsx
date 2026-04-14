/**
 * GameView.tsx — Visualização 3D do jogo
 *
 * Componente puramente apresentacional: recebe o estado do jogo do App pai
 * e o renderiza em um canvas Three.js. Não possui estado próprio além da
 * referência ao grupo SVG da rosa dos ventos.
 *
 * A rosa dos ventos é atualizada a cada frame via DOM direto (sem re-render
 * do React), porque o azimute da câmera muda em todo frame de OrbitControls
 * e seria muito custoso usar useState para isso.
 */
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

/**
 * CameraWatcher — componente interno ao Canvas que lê o azimute da câmera
 * a cada frame e rotaciona o grupo SVG da rosa dos ventos via setAttribute,
 * sem disparar re-renders do React.
 *
 * Precisa estar dentro do Canvas para ter acesso ao contexto do Three.js.
 */
function CameraWatcher({ compassRef }: { compassRef: React.RefObject<SVGGElement | null> }) {
    useFrame(({ camera }) => {
        if (!compassRef.current) return;
        // Azimute: ângulo horizontal da câmera no plano XZ, em graus
        const azimuth = Math.atan2(camera.position.x, camera.position.z) * (180 / Math.PI);
        compassRef.current.setAttribute("transform", `rotate(${azimuth}, 40, 40)`);
    });
    return null;
}

interface GameViewProps {
    gameState: GameState;
    currentCommand: string; // último comando executado (aciona animação do Player)
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
        stepCounter, // usado como stepIndex do Player — incrementa a cada ação para acionar animação
    } = gameState;

    // Ref compartilhada entre CameraWatcher (dentro do Canvas) e CompassRose (fora do Canvas)
    const compassInnerRef = useRef<SVGGElement | null>(null);

    const [visualX, visualZ] = getVisualPosition(playerGridPos, activeStage.floor);

    return (
        <div className={styles.gameView}>
            {/* Modal de vitória: aparece quando todos os botões do mapa são ativados */}
            <VictoryModal isOpen={isVictory} onNextStage={onNextStage} />

            {/* Barra de seleção de fase */}
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

            {/* Canvas Three.js — key muda ao trocar de fase para forçar remontagem completa */}
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

                    {/* OrbitControls permite rotacionar e inclinar a câmera com o mouse/toque */}
                    <OrbitControls enablePan={false} enableZoom={false} />

                    {/* Atualiza a rosa dos ventos a cada frame com o azimute da câmera */}
                    <CameraWatcher compassRef={compassInnerRef} />
                </Canvas>

                {/* Rosa dos ventos: sobreposta ao canvas, orientada pelo CameraWatcher */}
                <CompassRose rotationIndex={playerRotation} innerRef={compassInnerRef} />
            </div>
        </div>
    );
}

/**
 * Converte a posição lógica do jogador na grade (coluna, linha) para
 * coordenadas visuais do Three.js, centralizando o mapa na origem (0, 0, 0).
 */
const getVisualPosition = (gridPos: [number, number], floorString: string) => {
    const mapRows = floorString.trim().split("\n");
    const mapWidth = Math.max(...mapRows.map((r) => r.length));
    const mapDepth = mapRows.length;
    const x = gridPos[0] - mapWidth / 2 + 0.5;
    const z = gridPos[1] - mapDepth / 2 + 0.5;
    return [x, z] as [number, number];
};
