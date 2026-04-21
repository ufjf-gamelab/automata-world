import React from "react";
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
                        {"‹"}
                    </button>
                )}

                {!isSimPanelOpen && (
                    <button
                        onClick={() => setSimPanelOpen(true)}
                        className={styles.expandButton}
                        title="Expandir painel de simulação"
                    >{">"}
                        
                    </button>
                )}
            </div>
            {isSimPanelOpen && (
                <div className={styles.panelContent}>
                    <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                        placeholder="Palavra de entrada"
                        disabled={animationStatus === "running"}
                    />
                    {animationStatus !== "running" ? (
                        <button onClick={handlePlayAnimation} className={styles.playButton}>
                            Play
                        </button>
                    ) : (
                        <button onClick={handleStopAnimation} className={styles.danger}>
                            Stop
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
