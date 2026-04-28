import React from "react";
import "./Modal.css";

interface ModalProps {
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm: () => void;
    onCancel: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, message, type, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    {type === "confirm" && (
                        <button className="btn-cancel" onClick={onCancel}>
                            Cancelar
                        </button>
                    )}
                    <button className="btn-confirm" onClick={onConfirm}>
                        {type === "confirm" ? "Confirmar" : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
};
