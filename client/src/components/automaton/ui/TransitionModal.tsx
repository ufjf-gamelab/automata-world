import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css";
import CommandSequenceBuilder from "./CommandSequenceBuilder";

interface TransitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (label: string, action?: string) => void;
    initialLabel?: string;
    initialAction?: string;
    title: string;
    /** Lista de símbolos permitidos; undefined = sem restrição */
    allowedSymbols?: string[];
    /** Lista de comandos permitidos; undefined = sem restrição */
    allowedCommands?: string[];
    /** false = seção de ação oculta */
    edgeActionsAllowed?: boolean;
}

const TransitionModal: React.FC<TransitionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialLabel = "",
    initialAction = "",
    title,
    allowedSymbols,
    allowedCommands,
    edgeActionsAllowed = true,
}) => {
    const [label, setLabel] = useState(initialLabel.toLowerCase());
    const [sequence, setSequence] = useState(initialAction.toLowerCase());

    useEffect(() => {
        setLabel(initialLabel.toLowerCase());
        setSequence(initialAction.toLowerCase());
    }, [initialLabel, initialAction, isOpen]);

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
            .replace(/[^a-zA-Z]/g, "")
            .slice(0, 1)
            .toLowerCase();

        if (allowedSymbols && value && !allowedSymbols.includes(value)) return;
        setLabel(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label) onSubmit(label, sequence || undefined);
    };

    if (!isOpen) return null;

    const symbolsHint =
        allowedSymbols && allowedSymbols.length > 0
            ? `Permitidos: ${allowedSymbols.map((s) => s.toUpperCase()).join(", ")}`
            : "Qualquer letra (a–z)";

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>
                            Símbolo da fita
                            {allowedSymbols && (
                                <span className={styles.optional}>🔒 {symbolsHint}</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={label.toUpperCase()}
                            onChange={handleLabelChange}
                            placeholder={symbolsHint}
                            autoFocus
                            className={styles.symbolInput}
                        />
                    </div>

                    {edgeActionsAllowed && (
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>
                                Ação ao percorrer transição
                                <span className={styles.optional}>(opcional)</span>
                            </label>
                            <CommandSequenceBuilder
                                value={sequence}
                                onChange={setSequence}
                                allowedCommands={allowedCommands}
                            />
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={!label}>
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransitionModal;
