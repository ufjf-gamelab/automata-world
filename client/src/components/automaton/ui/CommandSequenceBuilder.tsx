/**
 * CommandSequenceBuilder.tsx — Seletor de ação única do jogo
 *
 * Exibe os comandos disponíveis como botões de seleção exclusiva.
 * Clicar num comando selecionado o desmarca (volta para "nenhuma ação").
 */
import React from "react";
import { GAME_COMMANDS } from "../../game/gameConfig";
import styles from "./TransitionModal.module.css";

interface CommandSequenceBuilderProps {
    value: string; // comando selecionado (ex: "f"), ou "" se nenhum
    onChange: (cmd: string) => void;
}

const CommandSequenceBuilder: React.FC<CommandSequenceBuilderProps> = ({ value, onChange }) => {
    // Clicar no comando já selecionado desmarca; clicar em outro seleciona
    const handleSelect = (key: string) => onChange(value === key ? "" : key);

    return (
        <div className={styles.commandGrid}>
            {GAME_COMMANDS.map((cmd) => (
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
