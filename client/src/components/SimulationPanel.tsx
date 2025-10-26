// src/components/SimulationPanel.tsx
import React from "react";
// Importa o CSS Module
import styles from "./SimulationPanel.module.css";

interface SimulationPanelProps {
    isSimPanelOpen: boolean;
    setSimPanelOpen: (isOpen: boolean) => void;
    inputWord: string;
    setInputWord: (word: string) => void;
    animationStatus: "idle" | "running" | "accepted" | "rejected";
    handlePlayAnimation: () => void;
    handleStopAnimation: () => void;
    getStatusMessage: () => string;
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
}) => {
    return (
        // Usa template literals para as classes condicionais
        <div className={`${styles.simulationPanel} ${isSimPanelOpen ? styles.open : styles.collapsed}`}>
            <div className={styles.panelHeader}>
                {isSimPanelOpen && <h4>Simulação</h4>}

                {isSimPanelOpen && (
                    <button
                        onClick={() => setSimPanelOpen(false)}
                        className={styles.toggleButton} // Usa a classe do module
                        title="Recolher painel"
                    >
                        {"‹"}
                    </button>
                )}

                {!isSimPanelOpen && (
                    <button
                        onClick={() => setSimPanelOpen(true)}
                        className={styles.expandButton} // Usa a classe do module
                        title="Expandir painel de simulação"
                    >
                        ▶️
                    </button>
                )}
            </div>
            {isSimPanelOpen && (
                <div className={styles.panelContent}>
                    {" "}
                    {/* Usa a classe do module */}
                    <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value)}
                        placeholder="Palavra de entrada"
                        disabled={animationStatus === "running"}
                        // input não precisa de classe do module se estilizado via seletor de tag
                    />
                    {animationStatus !== "running" ? (
                        <button onClick={handlePlayAnimation} className={styles.playButton}>
                            {" "}
                            {/* Usa a classe do module */}
                            Play
                        </button>
                    ) : (
                        <button onClick={handleStopAnimation} className={styles.danger}>
                            {" "}
                            {/* Usa a classe do module */}
                            Stop
                        </button>
                    )}
                    {/* Usa template literal para o estado da status bar */}
                    <div className={`${styles.statusBar} ${styles[animationStatus]}`}>{getStatusMessage()}</div>
                </div>
            )}
        </div>
    );
};

export default SimulationPanel;
