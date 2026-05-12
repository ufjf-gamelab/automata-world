import { useState } from "react";
import { createPortal } from "react-dom";
import { stagesList } from "../data/Stages";
import type { Stage } from "../data/types";
import MapEditorModal from "./MapEditorModal";
import styles from "./StageSelector.module.css";

interface StageSelectorProps {
    activeStage: Stage;
    onChangeStage: (stage: Stage) => void;
    customStages: Stage[];
    onSaveCustomStage: (stage: Stage) => void;
    onDeleteCustomStage: (id: number) => void;
}

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

function MapPreview({ floor }: { floor: string }) {
    const grid = parseFloor(floor);
    const maxH = Math.max(...grid.flatMap((row) => row.map((c) => c.height)), 1);
    return (
        <div className={styles.mapPreview}>
            {grid.map((row, z) => (
                <div key={z} className={styles.mapRow}>
                    {row.map((cell, x) => {
                        if (cell.empty) return <div key={x} className={styles.cellEmpty} />;
                        const b = 30 + Math.round((cell.height / maxH) * 55);
                        const bg = cell.isButton ? `hsl(211,75%,${b}%)` : `hsl(218,55%,${b}%)`;
                        return (
                            <div
                                key={x}
                                className={`${styles.cell} ${cell.isButton ? styles.cellButton : ""}`}
                                style={{ backgroundColor: bg }}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

type EditorState = Stage | null | undefined;

export default function StageSelector({
    activeStage,
    onChangeStage,
    customStages,
    onSaveCustomStage,
    onDeleteCustomStage,
}: StageSelectorProps) {
    const [isListOpen, setIsListOpen] = useState(false);
    const [editorState, setEditorState] = useState<EditorState>(undefined);

    const allStages = [...stagesList, ...customStages];
    const currentIndex = allStages.findIndex((s) => s.id === activeStage.id);

    const goToPrevious = () => {
        const prev = allStages[currentIndex - 1];
        if (prev) onChangeStage(prev);
    };

    const goToNext = () => {
        const next = allStages[currentIndex + 1];
        if (next) onChangeStage(next);
    };

    const selectStage = (stage: Stage) => {
        onChangeStage(stage);
        setIsListOpen(false);
    };

    const openNew = () => {
        setIsListOpen(false);
        setEditorState(null);
    };

    const openEdit = (stage: Stage, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsListOpen(false);
        setEditorState(stage);
    };

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Excluir este mapa permanentemente?")) return;
        onDeleteCustomStage(id);
        if (activeStage.id === id) onChangeStage(stagesList[0]);
    };

    const handleSave = (stage: Stage) => {
        onSaveCustomStage(stage);
        setEditorState(undefined);
        onChangeStage(stage);
    };

    const isEditorOpen = editorState !== undefined;

    /* ── Modal de lista — renderizado via portal para escapar do overflow da stageBar ── */
    const listModal =
        isListOpen &&
        createPortal(
            <div className={styles.modalOverlay} onClick={() => setIsListOpen(false)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>Selecionar Fase</h3>
                        <button className={styles.closeBtn} onClick={() => setIsListOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className={styles.scrollArea}>
                        <p className={styles.sectionLabel}>Fases oficiais</p>
                        <div className={styles.stageGrid}>
                            {stagesList.map((stage, i) => (
                                <button
                                    key={stage.id}
                                    className={`${styles.stageCard} ${stage.id === activeStage.id ? styles.stageCardActive : ""}`}
                                    onClick={() => selectStage(stage)}
                                >
                                    <div className={styles.cardPreview}>
                                        <MapPreview floor={stage.floor} />
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardNumber}>{i + 1}</span>
                                        <span className={styles.cardName}>{stage.name}</span>
                                        {stage.permissions && (
                                            <span className={styles.cardLock}>🔒</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {customStages.length > 0 && (
                            <>
                                <p className={styles.sectionLabel}>Meus mapas</p>
                                <div className={styles.stageGrid}>
                                    {customStages.map((stage, i) => (
                                        <button
                                            key={stage.id}
                                            className={`${styles.stageCard} ${stage.id === activeStage.id ? styles.stageCardActive : ""}`}
                                            onClick={() => selectStage(stage)}
                                        >
                                            <div className={styles.cardPreview}>
                                                <MapPreview floor={stage.floor} />
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span className={styles.cardNumber}>#{i + 1}</span>
                                                <span className={styles.cardName}>
                                                    {stage.name}
                                                </span>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={(e) => openEdit(stage, e)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={(e) => handleDelete(stage.id, e)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button className={styles.newMapBtn} onClick={openNew}>
                            ＋ Criar novo mapa
                        </button>
                    </div>
                </div>
            </div>,
            document.body,
        );

    /* ── Editor — também via portal ── */
    const editorModal =
        isEditorOpen &&
        createPortal(
            <MapEditorModal
                stage={editorState ?? undefined}
                onSave={handleSave}
                onClose={() => setEditorState(undefined)}
            />,
            document.body,
        );

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
                    onClick={() => setIsListOpen(true)}
                    title="Selecionar fase"
                >
                    <span className={styles.stageName}>{activeStage.name}</span>
                    <span className={styles.counter}>
                        {currentIndex + 1}/{allStages.length}
                    </span>
                    <span className={styles.gridIcon}>⊞</span>
                </button>

                <button
                    className={styles.navBtn}
                    onClick={goToNext}
                    disabled={currentIndex === allStages.length - 1}
                    title="Próxima fase"
                >
                    ›
                </button>

                <button className={styles.sandboxBtn} onClick={openNew} title="Criar novo mapa">
                    ＋ Mapa
                </button>
            </div>

            {listModal}
            {editorModal}
        </>
    );
}
