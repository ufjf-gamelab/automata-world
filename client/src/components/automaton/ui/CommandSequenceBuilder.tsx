import React from "react";
import { GAME_COMMANDS } from "../../game/gameConfig";
import styles from "./TransitionModal.module.css";

interface CommandSequenceBuilderProps {
    value: string;
    onChange: (cmd: string) => void;
    /** Filtra os comandos exibidos; undefined = sem restrição */
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
        <div className={styles.commandGrid}>
            {visibleCommands.map((cmd) => (
                <button
                    key={cmd.key}
                    type="button"
                    className={`${styles.commandButton} ${value === cmd.key ? styles.commandButtonActive : ""}`}
                    onClick={() => handleSelect(cmd.key)}
                >
                    {cmd.display}
                </button>
            ))}
        </div>
    );
};

export default CommandSequenceBuilder;
