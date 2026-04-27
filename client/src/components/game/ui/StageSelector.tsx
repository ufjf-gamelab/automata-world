import { useState } from "react";
import { stagesList } from "../data/Stages";
import type { Stage } from "../data/types";
import styles from "./StageSelector.module.css";

interface StageSelectorProps {
    activeStage: Stage;
    onChangeStage: (stage: Stage) => void;
}

/**
 * Converte a string do mapa em uma matriz de células para o preview.
 * Retorna cada célula com sua altura e se é um botão.
 */
function parseFloor(floor: string) {
    return floor
        .trimEnd()
        .split("\n")
        .map((row) =>
            row.split("").map((char) => {
                if (char === " " || char === "-")
                    return { empty: true, height: 0, isButton: false };
                const val = parseInt(char);
                const isButton = val === 0 || val > 5;
                const height = isButton ? (val === 0 ? 5 : val - 5) : val;
                return { empty: false, height, isButton };
            }),
        );
}

/** Preview isométrico simplificado do mapa usando divs coloridos */
function MapPreview({ floor }: { floor: string }) {
    const grid = parseFloor(floor);
    const maxH = Math.max(...grid.flatMap((row) => row.map((c) => c.height)), 1);

    return (
        <div className={styles.mapPreview}>
            {grid.map((row, z) => (
                <div key={z} className={styles.mapRow}>
                    {row.map((cell, x) => {
                        if (cell.empty) return <div key={x} className={styles.cellEmpty} />;
                        const brightness = 40 + Math.round((cell.height / maxH) * 50);
                        const bg = cell.isButton
                            ? `hsl(211, 80%, ${brightness}%)`
                            : `hsl(211, 61%, ${brightness}%)`;
                        return (
                            <div
                                key={x}
                                className={`${styles.cell} ${cell.isButton ? styles.cellButton : ""}`}
                                style={{ backgroundColor: bg }}
                                title={`(${x},${z}) h=${cell.height}${cell.isButton ? " 🔘" : ""}`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default function StageSelector({ activeStage, onChangeStage }: StageSelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentIndex = stagesList.findIndex((s) => s.id === activeStage.id);

    const goToPrevious = () => {
        const previous = stagesList[currentIndex - 1];
        if (previous) onChangeStage(previous);
    };

    const goToNext = () => {
        const next = stagesList[currentIndex + 1];
        if (next) onChangeStage(next);
    };

    const selectStage = (stage: Stage) => {
        onChangeStage(stage);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className={styles.selector}>
                <button
                    className={styles.navBtn}
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    title="Fase anterior"
                >
                    ‹
                </button>

                <button
                    className={styles.nameBtn}
                    onClick={() => setIsModalOpen(true)}
                    title="Selecionar fase"
                >
                    <span className={styles.stageName}>{activeStage.name}</span>
                    <span className={styles.counter}>
                        {currentIndex + 1}/{stagesList.length}
                    </span>
                    <span className={styles.gridIcon}>⊞</span>
                </button>

                <button
                    className={styles.navBtn}
                    onClick={goToNext}
                    disabled={currentIndex === stagesList.length - 1}
                    title="Próxima fase"
                >
                    ›
                </button>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Selecionar Fase</h3>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setIsModalOpen(false)}
                                title="Fechar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.stageGrid}>
                            {stagesList.map((stage, i) => (
                                <button
                                    key={stage.id}
                                    className={`${styles.stageCard} ${
                                        stage.id === activeStage.id ? styles.stageCardActive : ""
                                    }`}
                                    onClick={() => selectStage(stage)}
                                >
                                    <div className={styles.cardPreview}>
                                        <MapPreview floor={stage.floor} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardNumber}>{i + 1}</span>
                                        <span className={styles.cardName}>{stage.name}</span>
                                        {stage.permissions && (
                                            <span
                                                className={styles.cardLock}
                                                title="Fase com restrições"
                                            >
                                                🔒
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
