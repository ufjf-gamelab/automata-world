// src/components/TransitionModal.tsx
import React, { useState, useEffect } from "react";
import styles from "./TransitionModal.module.css"; // Import module

interface TransitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (label: string) => void;
    initialValue?: string; // Para edição
    title: string; // Título dinâmico
}

const TransitionModal: React.FC<TransitionModalProps> = ({ isOpen, onClose, onSubmit, initialValue = "", title }) => {
    const [label, setLabel] = useState(initialValue);

    // Reseta o label quando o modal é reaberto com um valor inicial diferente
    useEffect(() => {
        setLabel(initialValue);
    }, [initialValue, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label.trim()) {
            // Não permite labels vazios
            onSubmit(label.trim());
        } else {
            alert("O símbolo da transição não pode ser vazio.");
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Símbolo(s)"
                        autoFocus
                        maxLength={5}
                    />
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

export default TransitionModal;
