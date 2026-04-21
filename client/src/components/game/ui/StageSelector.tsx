import { useState, useRef, useEffect } from "react";
import { stagesList } from "../data/Stages";
import type { Stage } from "../data/types";
import styles from "./StageSelector.module.css";

interface StageSelectorProps {
    activeStage: Stage;
    onChangeStage: (stage: Stage) => void;
}

export default function StageSelector({ activeStage, onChangeStage }: StageSelectorProps) {
    const [aberto, setAberto] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const indiceAtual = stagesList.findIndex((s) => s.id === activeStage.id);

    const irParaAnterior = () => {
        const anterior = stagesList[indiceAtual - 1];
        if (anterior) onChangeStage(anterior);
    };

    const irParaProxima = () => {
        const proxima = stagesList[indiceAtual + 1];
        if (proxima) onChangeStage(proxima);
    };

    const selecionarFase = (fase: Stage) => {
        onChangeStage(fase);
        setAberto(false);
    };

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const fechar = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setAberto(false);
            }
        };
        document.addEventListener("mousedown", fechar);
        return () => document.removeEventListener("mousedown", fechar);
    }, []);

    return (
        <div className={styles.seletor} ref={ref}>
            <button
                className={styles.navBtn}
                onClick={irParaAnterior}
                disabled={indiceAtual === 0}
                title="Fase anterior"
            >
                ‹
            </button>

            <button
                className={styles.nomeBtn}
                onClick={() => setAberto((a) => !a)}
                title="Selecionar fase"
            >
                <span className={styles.nomeFase}>{activeStage.name}</span>
                <span className={styles.contador}>
                    {indiceAtual + 1}/{stagesList.length}
                </span>
                <span className={styles.seta}>{aberto ? "▲" : "▼"}</span>
            </button>

            <button
                className={styles.navBtn}
                onClick={irParaProxima}
                disabled={indiceAtual === stagesList.length - 1}
                title="Próxima fase"
            >
                ›
            </button>

            {aberto && (
                <div className={styles.dropdown}>
                    {stagesList.map((fase, i) => (
                        <button
                            key={fase.id}
                            className={`${styles.dropdownItem} ${
                                fase.id === activeStage.id ? styles.dropdownItemAtivo : ""
                            }`}
                            onClick={() => selecionarFase(fase)}
                        >
                            <span className={styles.dropdownNumero}>{i + 1}</span>
                            <span className={styles.dropdownNome}>{fase.name}</span>
                            {fase.permissions && (
                                <span className={styles.cadeado} title="Fase com restrições">
                                    🔒
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
