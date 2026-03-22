import type { VictoryModalProps } from "./Types";
import "./VictoryModal.css";

export default function VictoryModal({ isOpen, onNextStage }: VictoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="win-overlay">
            <div className="win-modal">
                <h1>🎉 Parabéns! 🎉</h1>
                <p>Você ativou todos os botões!</p>

                <button className="next-stage-btn" onClick={onNextStage}>
                    Próxima Fase ➔
                </button>
            </div>
        </div>
    );
}
