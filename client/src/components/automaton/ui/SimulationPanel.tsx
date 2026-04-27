import React, { useEffect } from "react";
import styles from "./SimulationPanel.module.css";
import type { StagePermissions } from "../../game/data/types";

/**
 * Presets de velocidade da simulação.
 * O valor é o `simulationSpeed` em ms passado ao useSimulation.
 * Lento  = 2000ms por fase → animações confortáveis de assistir
 * Normal = 1200ms por fase → padrão, walk (1000ms) termina com folga
 * Rápido =  700ms por fase → não dá tempo para walk terminar, mas é mais ágil
 */
export const SPEED_PRESETS = [
    { label: "Lento", value: 2000 },
    { label: "Normal", value: 1200 },
    { label: "Rápido", value: 700 },
] as const;

export type SpeedPreset = (typeof SPEED_PRESETS)[number]["value"];

interface SimulationPanelProps {
    isSimPanelOpen: boolean;
    setSimPanelOpen: (isOpen: boolean) => void;
    inputWord: string;
    setInputWord: (word: string) => void;
    animationStatus: "idle" | "running" | "accepted" | "rejected";
    handlePlayAnimation: () => void;
    handleStopAnimation: () => void;
    getStatusMessage: () => string;
    permissions?: StagePermissions;
    /** Velocidade atual da simulação em ms */
    simulationSpeed: number;
    /** Callback para alterar a velocidade */
    onSpeedChange: (speed: number) => void;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({
    isSimPanelOpen,
    setSimPanelOpen,
    inputWord,
    setInputWord,
    animationStatus,
    handlePlayAnimation,
    handleStopAnimation,
    getStatusMessage,
    permissions,
    simulationSpeed,
    onSpeedChange,
}) => {
    const fixedTape = permissions?.fixedTape;

    useEffect(() => {
        if (fixedTape !== undefined) setInputWord(fixedTape.toUpperCase());
    }, [fixedTape]);

    const isRunning = animationStatus === "running";

    return (
        <div
            className={`${styles.simulationPanel} ${isSimPanelOpen ? styles.open : styles.collapsed}`}
        >
            <div className={styles.panelHeader}>
                {isSimPanelOpen && <h4>Simulação</h4>}

                {isSimPanelOpen && (
                    <button
                        onClick={() => setSimPanelOpen(false)}
                        className={styles.toggleButton}
                        title="Recolher painel"
                    >
                        ‹
                    </button>
                )}

                {!isSimPanelOpen && (
                    <>
                        <span className={styles.collapsedLabel}>Painel de simulação</span>
                        <button
                            onClick={() => setSimPanelOpen(true)}
                            className={styles.expandButton}
                            title="Expandir painel de simulação"
                        >
                            ▶
                        </button>
                    </>
                )}
            </div>

            {isSimPanelOpen && (
                <div className={styles.panelContent}>
                    {fixedTape !== undefined && (
                        <p className={styles.fixedTapeLabel}>🔒 Fita fixada pela fase</p>
                    )}

                    <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                        placeholder="Palavra de entrada"
                        disabled={isRunning || fixedTape !== undefined}
                    />

                    {/* ── Controle de velocidade ────────────────────────────
                        Para ajustar a velocidade das animações, basta clicar
                        em Lento / Normal / Rápido aqui no painel.
                        O valor numérico é o simulationSpeed em ms passado ao
                        useSimulation — altere SPEED_PRESETS acima para
                        calibrar conforme as animações do seu Player.
                    ─────────────────────────────────────────────────────── */}
                    <div className={styles.speedRow}>
                        <span className={styles.speedLabel}>⏱ Velocidade</span>
                        <div className={styles.speedBtns}>
                            {SPEED_PRESETS.map((preset) => (
                                <button
                                    key={preset.value}
                                    className={`${styles.speedBtn} ${
                                        simulationSpeed === preset.value
                                            ? styles.speedBtnActive
                                            : ""
                                    }`}
                                    onClick={() => onSpeedChange(preset.value)}
                                    disabled={isRunning}
                                    title={`${preset.value}ms por fase`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!isRunning ? (
                        <button onClick={handlePlayAnimation} className={styles.playButton}>
                            ▶ Play
                        </button>
                    ) : (
                        <button onClick={handleStopAnimation} className={styles.danger}>
                            ■ Stop
                        </button>
                    )}

                    <div className={`${styles.statusBar} ${styles[animationStatus]}`}>
                        {getStatusMessage()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationPanel;
