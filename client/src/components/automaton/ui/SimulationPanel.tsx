import React, { useEffect } from "react";
import styles from "./SimulationPanel.module.css";
import type { StagePermissions } from "../../game/data/types";

export const SPEED_PRESETS = [
    { label: "Lento",  value: 2000, icon: "🐢" },
    { label: "Normal", value: 1200, icon: "🚶" },
    { label: "Rápido", value: 700,  icon: "🏃" },
] as const;

export type SpeedPreset = typeof SPEED_PRESETS[number]["value"];

interface SimulationPanelProps {
    isSimPanelOpen: boolean;
    setSimPanelOpen: (isOpen: boolean) => void;
    inputWord: string;
    setInputWord: (word: string) => void;
    animationStatus: "idle" | "running" | "accepted" | "rejected";
    activeCharIndex: number;
    handlePlayAnimation: () => void;
    handleStopAnimation: () => void;
    getStatusMessage: () => string;
    permissions?: StagePermissions;
    simulationSpeed: number;
    onSpeedChange: (speed: number) => void;
}

function letterHue(ch: string): number {
    const code = ch.toUpperCase().charCodeAt(0);
    return ((code - 65) * (360 / 26)) % 360;
}

function TapeDisplay({
    word,
    activeCharIndex,
    status,
}: {
    word: string;
    activeCharIndex: number;
    status: string;
}) {
    if (!word) return null;
    const isSimulating = status === "running";

    return (
        <div className={styles.tapeDisplay}>
            {word.split("").map((ch, i) => {
                const isLetter = /[A-Za-z]/.test(ch);
                const hue = isLetter ? letterHue(ch) : null;

                const isRead    = isSimulating && i < activeCharIndex;
                const isCurrent = isSimulating && i === activeCharIndex;
                const isPending = isSimulating && i > activeCharIndex;

                const baseBg = hue !== null ? `hsl(${hue}, 68%, 86%)` : "#e9ecef";
                const baseFg = hue !== null ? `hsl(${hue}, 55%, 26%)` : "#495057";
                const readBg = hue !== null ? `hsl(${hue}, 40%, 92%)` : "#f1f3f5";
                const readFg = hue !== null ? `hsl(${hue}, 30%, 60%)` : "#adb5bd";
                const pendBg = hue !== null ? `hsl(${hue}, 20%, 95%)` : "#f8f9fa";
                const pendFg = hue !== null ? `hsl(${hue}, 15%, 72%)` : "#ced4da";

                let bg: string, fg: string;
                if (isRead)         { bg = readBg; fg = readFg; }
                else if (isCurrent) { bg = baseBg; fg = baseFg; }
                else if (isPending) { bg = pendBg; fg = pendFg; }
                else                { bg = baseBg; fg = baseFg; }

                return (
                    <span
                        key={i}
                        className={[
                            styles.tapeCell,
                            isRead    ? styles.tapeCellRead    : "",
                            isCurrent ? styles.tapeCellCurrent : "",
                            isPending ? styles.tapeCellPending : "",
                        ].filter(Boolean).join(" ")}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {isRead ? <span className={styles.checkMark}>✓</span> : ch.toUpperCase()}
                        {isCurrent && <span className={styles.cursor} />}
                    </span>
                );
            })}
        </div>
    );
}

const STATUS_META: Record<string, { icon: string }> = {
    idle:     { icon: "⏸"  },
    running:  { icon: "⚙"  },
    accepted: { icon: "✅" },
    rejected: { icon: "❌" },
};

const SimulationPanel: React.FC<SimulationPanelProps> = ({
    isSimPanelOpen,
    setSimPanelOpen,
    inputWord,
    setInputWord,
    animationStatus,
    activeCharIndex,
    handlePlayAnimation,
    handleStopAnimation,
    getStatusMessage,
    permissions,
    simulationSpeed,
    onSpeedChange,
}) => {
    const fixedTape = permissions?.fixedTape;
    const isRunning = animationStatus === "running";
    const meta = STATUS_META[animationStatus] ?? STATUS_META.idle;

    useEffect(() => {
        if (fixedTape !== undefined) setInputWord(fixedTape.toUpperCase());
    }, [fixedTape]);

    if (!isSimPanelOpen) {
        return (
            <button
                className={styles.collapsedPill}
                onClick={() => setSimPanelOpen(true)}
                title="Abrir painel de simulação"
            >
                🤖 Simulação
            </button>
        );
    }

    return (
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerIcon}>🤖</span>
                    <span className={styles.headerTitle}>Simulação</span>
                </div>
                <button
                    className={styles.collapseBtn}
                    onClick={() => setSimPanelOpen(false)}
                    title="Minimizar painel"
                >
                    ✕
                </button>
            </div>

            {/* Fita */}
            <section className={styles.section}>
                <label className={styles.sectionLabel}>
                    📼 Fita
                    {fixedTape !== undefined && (
                        <span className={styles.lockedBadge}>🔒 fixada</span>
                    )}
                </label>

                <input
                    type="text"
                    className={styles.tapeInput}
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                    placeholder="Ex: FEDF…"
                    disabled={isRunning || fixedTape !== undefined}
                    spellCheck={false}
                />

                {inputWord && (
                    <TapeDisplay word={inputWord} activeCharIndex={activeCharIndex} status={animationStatus} />
                )}

                {isRunning && inputWord && (
                    <div className={styles.tapeLegend}>
                        <span className={styles.legendRead}>✓ lidas</span>
                        <span className={styles.legendCurrent}>● lendo</span>
                        <span className={styles.legendPending}>○ pendentes</span>
                    </div>
                )}
            </section>

            <div className={styles.divider} />

            {/* Velocidade — botão único que cicla entre os presets */}
            <section className={styles.sectionRow}>
                <span className={styles.sectionLabel}>⏱ Velocidade</span>
                <button
                    className={styles.speedCycleBtn}
                    onClick={() => {
                        const idx = SPEED_PRESETS.findIndex((p) => p.value === simulationSpeed);
                        const next = SPEED_PRESETS[(idx + 1) % SPEED_PRESETS.length];
                        onSpeedChange(next.value);
                    }}
                    disabled={isRunning}
                    title="Clique para mudar a velocidade"
                >
                    {SPEED_PRESETS.find((p) => p.value === simulationSpeed)?.icon}{" "}
                    {SPEED_PRESETS.find((p) => p.value === simulationSpeed)?.label}
                </button>
            </section>

            <div className={styles.divider} />

            {/* Play / Stop */}
            <section className={styles.section}>
                {!isRunning ? (
                    <button
                        className={styles.playBtn}
                        onClick={handlePlayAnimation}
                        disabled={!inputWord.trim()}
                    >
                        ▶ Executar
                    </button>
                ) : (
                    <button className={styles.stopBtn} onClick={handleStopAnimation}>
                        ■ Parar
                    </button>
                )}
            </section>


        </div>
    );
};

export default SimulationPanel;