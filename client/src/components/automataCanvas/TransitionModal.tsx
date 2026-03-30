import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css";

const GAME_COMMANDS = [
    { key: "f", label: "F", description: "Frente" },
    { key: "p", label: "P", description: "Pula" },
    { key: "b", label: "B", description: "Botão" },
    { key: "n", label: "N", description: "Norte" },
    { key: "s", label: "S", description: "Sul" },
    { key: "l", label: "L", description: "Leste" },
    { key: "o", label: "O", description: "Oeste" },
];

interface TransitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (label: string) => void;
    initialValue?: string;
    title: string;
}

const TransitionModal: React.FC<TransitionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialValue = "",
    title,
}) => {
    const [selected, setSelected] = useState(initialValue.toLowerCase());

    useEffect(() => {
        setSelected(initialValue.toLowerCase());
    }, [initialValue, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selected) onSubmit(selected);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles.commandGrid}>
                        {GAME_COMMANDS.map((cmd) => (
                            <button
                                key={cmd.key}
                                type="button"
                                className={`${styles.commandButton} ${selected === cmd.key ? styles.commandButtonActive : ""}`}
                                onClick={() => setSelected(cmd.key)}
                            >
                                <span className={styles.commandKey}>{cmd.label}</span>
                                <span className={styles.commandDesc}>{cmd.description}</span>
                            </button>
                        ))}
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!selected}
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransitionModal;