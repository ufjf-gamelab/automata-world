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
}

const TransitionModal: React.FC<TransitionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialLabel = "",
    initialAction = "",
    title,
}) => {
    const [label, setLabel] = useState(initialLabel.toLowerCase());
    const [sequence, setSequence] = useState(initialAction.toLowerCase());

    useEffect(() => {
        setLabel(initialLabel.toLowerCase());
        setSequence(initialAction.toLowerCase());
    }, [initialLabel, initialAction, isOpen]);

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
            .replace(/[^a-zA-Z]/g, "")
            .slice(0, 1)
            .toLowerCase();
        setLabel(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label) onSubmit(label, sequence || undefined);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>Tape symbol</label>
                        <input
                            type="text"
                            value={label.toUpperCase()}
                            onChange={handleLabelChange}
                            placeholder="Any letter (a–z)"
                            autoFocus
                            className={styles.symbolInput}
                        />
                    </div>

                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>
                            Action sequence on transition
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <CommandSequenceBuilder value={sequence} onChange={setSequence} />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={!label}>
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransitionModal;
