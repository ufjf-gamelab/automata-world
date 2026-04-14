/**
 * useSimulation.ts — Hook que encapsula o loop de simulação do autômato finito
 *
 * Isola toda a lógica de "ler uma palavra letra por letra e seguir as transições"
 * para fora do AutomatonEditor, que fica responsável apenas pelo layout e UI.
 *
 * O ciclo de simulação alterna entre duas fases por tick (750ms cada):
 *
 *   "state" → Executa a ação de entrada do nó atual no jogo.
 *             Verifica se a palavra acabou (aceita ou rejeita).
 *             Se não acabou, avança para a fase "transition".
 *
 *   "transition" → Lê o próximo símbolo da palavra.
 *                  Procura a aresta correspondente que sai do nó atual.
 *                  Se encontrou: executa a ação da aresta e move para o nó destino (fase "state").
 *                  Se não encontrou: rejeita a palavra.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { Dispatch } from "react";
import type { Node, Edge } from "./AutomatonReducer";
import type { AnimationStatus, AnimationStep } from "./AutomatonEditorTypes";
import type { GameAction } from "../game/gameReducer";

interface UseSimulationParams {
    nodes: Node[];
    edges: Edge[];
    gameDispatch: Dispatch<GameAction>; // controla o estado do jogo durante a simulação
    setCurrentCommand: (cmd: string) => void; // informa ao Player qual animação executar
    simulationSpeed?: number;
    onStartTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onEndTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onStateEnter?: (nodeId: string) => void;
    onStateExit?: (nodeId: string) => void;
}

export function useSimulation({
    nodes,
    edges,
    gameDispatch,
    setCurrentCommand,
    simulationSpeed = 750,
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: UseSimulationParams) {
    const [inputWord, setInputWord] = useState("FFFFF");
    const [status, setStatus] = useState<AnimationStatus>("idle");
    const [step, setStep] = useState<AnimationStep | null>(null);
    const timeoutRef = useRef<number | null>(null);

    // Refs evitam closures stale: os callbacks externos podem mudar entre renders,
    // mas o useEffect do loop sempre lê a versão mais atual sem precisar
    // ser re-registrado (o que reiniciaria o timer).
    const onStartRef = useRef(onStartTransition);
    const onEndRef = useRef(onEndTransition);
    const onEnterRef = useRef(onStateEnter);
    const onExitRef = useRef(onStateExit);
    useEffect(() => {
        onStartRef.current = onStartTransition;
    }, [onStartTransition]);
    useEffect(() => {
        onEndRef.current = onEndTransition;
    }, [onEndTransition]);
    useEffect(() => {
        onEnterRef.current = onStateEnter;
    }, [onStateEnter]);
    useEffect(() => {
        onExitRef.current = onStateExit;
    }, [onStateExit]);

    // --- Loop principal ---

    useEffect(() => {
        // Para qualquer timer pendente quando a simulação for pausada ou encerrada
        if (status !== "running") {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }
        if (!step) return;

        timeoutRef.current = window.setTimeout(async () => {
            const { currentNodeId, characterIndex, type } = step;

            // ── Fase "state": entrada no nó ──────────────────────────────────
            if (type === "state") {
                const currentNode = nodes.find((n) => n.id === currentNodeId);

                // Executa cada comando da sequência de ação do estado no jogo
                if (currentNode?.action) {
                    setCurrentCommand(currentNode.action);
                    const actions = currentNode.action.toLowerCase().split("");
                    for (const ch of currentNode.action.toLowerCase()) {
                        gameDispatch({ type: "EXECUTE_ACTION", payload: ch });
                        await new Promise((r) =>
                            setTimeout(r, simulationSpeed / Math.max(actions.length, 1)),
                        );
                    }
                }

                onEnterRef.current?.(currentNodeId!);

                // Palavra consumida: verifica se o estado atual é final
                if (characterIndex >= inputWord.length) {
                    if (currentNode?.isFinal) {
                        setStatus("accepted");
                    } else {
                        setStatus("rejected");
                        setStep((prev) => (prev ? { ...prev, failed: true } : null));
                    }
                    return;
                }

                // Avança para a fase de transição sem consumir símbolo ainda
                setStep((prev) => (prev ? { ...prev, type: "transition" } : null));
                return;
            }

            // ── Fase "transition": leitura do símbolo e troca de estado ──────
            if (characterIndex >= inputWord.length) {
                const currentNode = nodes.find((n) => n.id === currentNodeId);
                if (currentNode?.isFinal) {
                    setStatus("accepted");
                } else {
                    setStatus("rejected");
                    setStep((prev) => (prev ? { ...prev, failed: true } : null));
                }
                return;
            }

            const symbol = inputWord[characterIndex].toLowerCase();

            // Procura a aresta que sai do nó atual com o símbolo lido
            const transition = edges.find(
                (e) => e.source === currentNodeId && e.label.toLowerCase() === symbol,
            );

            if (transition) {
                // Dispara os callbacks externos (usados para integrações futuras)
                onExitRef.current?.(currentNodeId!);
                onStartRef.current?.(transition.id, currentNodeId!, transition.target, symbol);
                onEndRef.current?.(transition.id, currentNodeId!, transition.target, symbol);

                // Executa a ação da aresta no jogo (se existir)
                if (transition.action) {
                    setCurrentCommand(transition.action);
                    const actions = transition.action.toLowerCase().split('');
                    for (const ch of transition.action.toLowerCase()) {
                        gameDispatch({ type: "EXECUTE_ACTION", payload: ch });
                        await new Promise(r => setTimeout(r, simulationSpeed / Math.max(actions.length, 1)));
                    }
                }

                // Move para o nó destino e reinicia na fase "state"
                setStep({
                    currentNodeId: transition.target,
                    activeEdgeId: transition.id,
                    characterIndex: characterIndex + 1,
                    failed: false,
                    type: "state",
                });
            } else {
                // Nenhuma transição encontrada para este símbolo → rejeita
                setStatus("rejected");
                setStep((prev) => (prev ? { ...prev, failed: true, activeEdgeId: null } : null));
            }
        }, 750);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [status, step, inputWord, nodes, edges]);

    // --- Controles externos ---

    /** Inicia a simulação a partir do estado inicial do autômato */
    const play = () => {
        const initialNode = nodes.find((n) => n.isInitial);
        if (!initialNode) {
            alert("Defina um estado inicial antes de iniciar a simulação.");
            return;
        }
        // Reinicia o jogo sem herdar comandos anteriores
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
        setCurrentCommand("");
        setStatus("running");
        // Começa na fase "state" para executar a ação de entrada do estado inicial
        setStep({
            currentNodeId: initialNode.id,
            activeEdgeId: null,
            characterIndex: 0,
            failed: false,
            type: "state",
        });
    };

    /** Para a simulação e devolve o jogo ao estado inicial */
    const stop = () => {
        setStatus("idle");
        setStep(null);
        setCurrentCommand("");
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
    };

    /** Mensagem de status exibida no painel de simulação */
    const getStatusMessage = useCallback(() => {
        switch (status) {
            case "running":
                return `Lendo: "${inputWord}"...`;
            case "accepted":
                return `"${inputWord}" ACEITA!`;
            case "rejected":
                return `"${inputWord}" REJEITADA!`;
            default:
                return "Pronto para simular.";
        }
    }, [status, inputWord]);

    return {
        inputWord,
        setInputWord,
        status,
        step,
        play,
        stop,
        getStatusMessage,
    };
}
