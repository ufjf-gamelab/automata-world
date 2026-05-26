import React from "react";
import { GAME_COMMANDS } from "../../game/gameConfig";
import styles from "./CommandSequenceBuilder.module.css";

interface CommandSequenceBuilderProps {
    value: string;
    onChange: (cmd: string) => void;
    allowedCommands?: string[];
}

const CommandSequenceBuilder: React.FC<CommandSequenceBuilderProps> = ({
    value,
    onChange,
    allowedCommands,
}) => {
    const visibleCommands = allowedCommands
        ? GAME_COMMANDS.filter((c) => allowedCommands.includes(c.key))
        : GAME_COMMANDS;

    const handleSelect = (key: string) => onChange(value === key ? "" : key);

    return (
        <div className={styles.grid}>
            {visibleCommands.map((cmd) => {
                const Icon = cmd.icon;
                const isActive = value === cmd.key;
                return (
                    <button
                        key={cmd.key}
                        type="button"
                        className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}
                        onClick={() => handleSelect(cmd.key)}
                        title={cmd.display}
                        aria-label={cmd.display}
                        aria-pressed={isActive}
                    >
                        <Icon size={18} />
                        <span className={styles.label}>{cmd.display}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CommandSequenceBuilder;
