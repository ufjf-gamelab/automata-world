import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css";
import CommandSequenceBuilder from "./CommandSequenceBuilder";

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
                            Action sequence on state entry
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <CommandSequenceBuilder value={sequence} onChange={setSequence} />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NodeActionModal;
