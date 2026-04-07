import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css";
import { GAME_COMMANDS } from "../game/gameConfig";

interface NodeActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (action?: string) => void;
    initialAction?: string;
    title: string;
}

const NodeActionModal: React.FC<NodeActionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialAction = "",
    title,
}) => {
    const [action, setAction] = useState(initialAction.toLowerCase());

    useEffect(() => {
        setAction(initialAction.toLowerCase());
    }, [initialAction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(action || undefined);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>
                            Ação ao entrar no estado
                            <span className={styles.optional}>(opcional)</span>
                        </label>
                        <div className={styles.commandGrid}>
                            {GAME_COMMANDS.map((cmd) => (
                                <button
                                    key={cmd.key}
                                    type="button"
                                    className={`${styles.commandButton} ${action === cmd.key ? styles.commandButtonActive : ""}`}
                                    onClick={() => setAction(action === cmd.key ? "" : cmd.key)}
                                >
                                    <span className={styles.commandKey}>{cmd.label}</span>
                                    <span className={styles.commandDesc}>{cmd.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NodeActionModal;
