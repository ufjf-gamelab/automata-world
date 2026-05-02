import { useState } from "react";
import type { TutorialSlide } from "../data/types";
import styles from "./TutorialModal.module.css";

interface TutorialModalProps {
    steps: TutorialSlide[];
    stageName: string;
    onClose: () => void;
}

function renderText(text: string) {
    return text
        .split(/\*\*(.+?)\*\*/g)
        .map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
        );
}

export default function TutorialModal({ steps, stageName, onClose }: TutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!steps || steps.length === 0) {
        onClose();
        return null;
    }

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const isFirst = currentStep === 0;

    const goNext = () => {
        if (isLast) {
            onClose();
            return;
        }
        setCurrentStep((i) => i + 1);
    };

    const goPrev = () => setCurrentStep((i) => Math.max(0, i - 1));

    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                {/* ── Área de imagem (parte superior) ── */}
                <div className={styles.imageArea}>
                    {step.image ? (
                        <img
                            src={step.image}
                            alt={`Tutorial passo ${currentStep + 1}`}
                            className={styles.image}
                        />
                    ) : (
                        /* Placeholder quando não há imagem */
                        <div className={styles.imagePlaceholder}>
                            <span className={styles.placeholderIcon}>📖</span>
                            <span className={styles.placeholderLabel}>{stageName}</span>
                        </div>
                    )}

                    {/* Badge de progresso sobre a imagem */}
                    <div className={styles.progressBadge}>
                        {currentStep + 1} / {steps.length}
                    </div>
                </div>

                {/* ── Balão de fala (parte inferior) ── */}
                <div className={styles.balloon}>
                    {/* Ponta do balão */}
                    <div className={styles.balloonTip} />

                    <p className={styles.balloonText}>{renderText(step.text)}</p>

                    {/* Dots de progresso */}
                    <div className={styles.dots}>
                        {steps.map((_, i) => (
                            <span
                                key={i}
                                className={`${styles.dot} ${i === currentStep ? styles.dotActive : ""} ${i < currentStep ? styles.dotDone : ""}`}
                            />
                        ))}
                    </div>

                    {/* Navegação */}
                    <div className={styles.navRow}>
                        <button className={styles.prevBtn} onClick={goPrev} disabled={isFirst}>
                            ← Anterior
                        </button>

                        <button className={styles.nextBtn} onClick={goNext}>
                            {isLast ? "Vamos lá! 🚀" : "Próximo →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
