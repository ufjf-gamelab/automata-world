import { useState, useRef, useEffect } from "react";
import { stagesList } from "../data/Stages";
import type { Stage } from "../data/types";
import styles from "./StageSelector.module.css";

interface StageSelectorProps {
    activeStage: Stage;
    onChangeStage: (stage: Stage) => void;
}

export default function StageSelector({ activeStage, onChangeStage }: StageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
        setIsOpen(false);
    };

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className={styles.selector} ref={ref}>
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
                onClick={() => setIsOpen((prev) => !prev)}
                title="Selecionar fase"
            >
                <span className={styles.stageName}>{activeStage.name}</span>
                <span className={styles.counter}>
                    {currentIndex + 1}/{stagesList.length}
                </span>
                <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
            </button>

            <button
                className={styles.navBtn}
                onClick={goToNext}
                disabled={currentIndex === stagesList.length - 1}
                title="Próxima fase"
            >
                ›
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {stagesList.map((stage, i) => (
                        <button
                            key={stage.id}
                            className={`${styles.dropdownItem} ${
                                stage.id === activeStage.id ? styles.dropdownItemActive : ""
                            }`}
                            onClick={() => selectStage(stage)}
                        >
                            <span className={styles.dropdownNumber}>{i + 1}</span>
                            <span className={styles.dropdownName}>{stage.name}</span>
                            {stage.permissions && (
                                <span className={styles.lock} title="Fase com restrições">
                                    🔒
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
