import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css";
import CommandSequenceBuilder from "./CommandSequenceBuilder";

interface NodeActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (action?: string) => void;
    initialAction?: string;
    title: string;
    /** Lista de comandos permitidos; undefined = sem restrição */
    allowedCommands?: string[];
}

const NodeActionModal: React.FC<NodeActionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialAction = "",
    title,
    allowedCommands,
}) => {
    const [sequence, setSequence] = useState(initialAction.toLowerCase());

    useEffect(() => {
        setSequence(initialAction.toLowerCase());
    }, [initialAction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(sequence || undefined);
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
                        <CommandSequenceBuilder
                            value={sequence}
                            onChange={setSequence}
                            allowedCommands={allowedCommands}
                        />
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
