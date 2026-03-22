import React from "react";
import type { CommandTapeProps } from "./Types";
import "./CommandTape.css";

const CHAR_WIDTH = 40;

export default function CommandTape({
    commands,
    commandIndex,
    isExecuting,
    onInputChange,
    onExecuteStep,
    onReset,
    onRetry,
}: CommandTapeProps) {
    // Verifica se terminou a execução (Índice chegou no fim e tem comandos)
    const isFinished = commandIndex >= commands.length && commands.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (commandIndex > 0) return; // Bloqueia edição se já começou (mas permite resetar)

        const val = e.target.value;
        if (/^[fedtpb]*$/i.test(val)) {
            onInputChange(val);
        }
    };

    const translateX = -(commandIndex * CHAR_WIDTH) - CHAR_WIDTH / 2;

    return (
        <div className="controls-container">
            <div className="input-row">
                <input
                    type="text"
                    value={commands}
                    onChange={handleChange}
                    placeholder="Comandos:f, e, d, t, p, b"
                    className="command-input"
                    disabled={commandIndex > 0}
                />

                {/* Botão de Limpar Tudo (Reset Total) */}
                <button onClick={onReset} className="reset-button" title="Limpar Tudo">
                    🗑️
                </button>
            </div>

            <div className="tape-container">
                <div className="tape-indicator" />
                <div className="tape-track" style={{ transform: `translateX(${translateX}px)` }}>
                    {commands.split("").map((char, idx) => {
                        let statusClass = "pending";
                        if (idx < commandIndex) statusClass = "executed";
                        if (idx === commandIndex) statusClass = "active";

                        return (
                            <div key={idx} className={`tape-char ${statusClass}`}>
                                {char}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="action-row">
                {isFinished ? (
                    // Se terminou: Botão de "Tentar Novamente"
                    <button onClick={onRetry} className="exec-button retry">
                        ↻ Reiniciar Mapa
                    </button>
                ) : (
                    <button
                        onClick={onExecuteStep}
                        disabled={commands.length === 0 || isExecuting}
                        className="exec-button"
                    >
                        Próximo Passo
                    </button>
                )}
            </div>

            <small style={{ color: "#aaa", fontSize: "0.8rem", marginTop: 5 }}>
                F: frente, E: esq, D: dir, T: trás, P: pula, B: botão
            </small>
        </div>
    );
}
