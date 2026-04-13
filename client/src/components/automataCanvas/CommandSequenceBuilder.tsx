// Shared component for building a sequence of game commands.
// Used by both NodeActionModal and TransitionModal.
import React from "react";
import { GAME_COMMANDS } from "../game/gameConfig";
import styles from "./TransitionModal.module.css";

interface CommandSequenceBuilderProps {
    value: string;           // current sequence (e.g. "fnf")
    onChange: (seq: string) => void;
}

const CommandSequenceBuilder: React.FC<CommandSequenceBuilderProps> = ({ value, onChange }) => {
    const append = (key: string) => onChange(value + key);
    const removeLast = () => onChange(value.slice(0, -1));
    const clear = () => onChange("");

    return (
        <div className={styles.sequenceBuilder}>
            {/* Current sequence display */}
            <div className={styles.sequenceDisplay}>
                {value
                    ? value.toUpperCase().split("").map((ch, i) => (
                        <span key={i} className={styles.sequenceChar}>{ch}</span>
                    ))
                    : <span className={styles.sequencePlaceholder}>—</span>
                }
            </div>

            {/* Command picker */}
            <div className={styles.commandGrid}>
                {GAME_COMMANDS.map((cmd) => (
                    <button
                        key={cmd.key}
                        type="button"
                        className={styles.commandButton}
                        onClick={() => append(cmd.key)}
                    >
                        {cmd.display}
                    </button>
                ))}
            </div>

            {/* Edit controls */}
            <div className={styles.sequenceControls}>
                <button type="button" className={styles.seqControlBtn} onClick={removeLast} disabled={!value}>
                    ⌫ Undo
                </button>
                <button type="button" className={styles.seqControlBtn} onClick={clear} disabled={!value}>
                    Clear
                </button>
            </div>
        </div>
    );
};

export default CommandSequenceBuilder;