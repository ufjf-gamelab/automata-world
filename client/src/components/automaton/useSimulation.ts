import { useState, useEffect, useRef, useCallback } from "react";
import type { Dispatch } from "react";
import type { Node, Edge } from "./AutomatonReducer";
import type { AnimationStatus, AnimationStep } from "./AutomatonEditorTypes";
import type { GameAction } from "../game/gameReducer";
import { CHAR_TO_COMMAND } from "../game/gameConfig";
import { useModal } from "../../contexts/ModalContext";

interface UseSimulationParams {
    nodes: Node[];
    edges: Edge[];
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
    simulationSpeed: number;
    onStartTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onEndTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onStateEnter?: (nodeId: string) => void;
    onStateExit?: (nodeId: string) => void;
}

/**
 * Duração estimada de cada comando no Player, em ms.
 * Para calibrar, ajuste estes valores conforme as animações do seu modelo 3D.
 * O somatório dos delays de uma sequência não deve ultrapassar simulationSpeed.
 */
export const ANIM_DURATION: Record<string, number> = {
    f: 900,
    p: 850,
    b: 750,
    n: 300,
    s: 300,
    l: 300,
    o: 300,
    e: 300,
    d: 300,
    t: 300,
};

function getAnimDuration(ch: string): number {
    return ANIM_DURATION[ch.toLowerCase()] ?? 500;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Executa uma sequência de chars de comando, disparando cada ação no jogo
 * e notificando o Player com a palavra correspondente (ex: "f" → "forward").
 * Cancela silenciosamente se `isCurrent()` retornar false.
 * Retorna o tempo total gasto em ms.
 */
async function runCommands(
    sequence: string,
    budget: number,
    isCurrent: () => boolean,
    dispatch: Dispatch<GameAction>,
    setCmd: (word: string) => void,
): Promise<number> {
    const chars = sequence.toLowerCase().split("").filter(Boolean);
    if (chars.length === 0) return 0;

    const totalNatural = chars.reduce((s, c) => s + getAnimDuration(c), 0);
    const scale = Math.min(1, budget / Math.max(totalNatural, 1));
    let spent = 0;

    for (const ch of chars) {
        if (!isCurrent()) return spent;

        // Notifica o Player com a palavra (ex: "forward") para acionar a animação
        const word = CHAR_TO_COMMAND[ch] ?? ch;
        setCmd(word);

        // Despacha o char para o gameReducer (lógica de movimento permanece em chars)
        dispatch({ type: "EXECUTE_ACTION", payload: ch });

        const wait = getAnimDuration(ch) * scale;
        spent += wait;
        await delay(wait);
    }
    return spent;
}

export function useSimulation({
    nodes,
    edges,
    gameDispatch,
    setCurrentCommand,
    simulationSpeed,
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: UseSimulationParams) {
    const [inputWord, setInputWord] = useState("");
    const [status, setStatus] = useState<AnimationStatus>("idle");
    const [step, setStep] = useState<AnimationStep | null>(null);

    const { showAlert } = useModal();
    const generationRef = useRef(0);

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

    useEffect(() => {
        if (status !== "running" || !step) return;

        const generation = ++generationRef.current;
        const isCurrent = () => generationRef.current === generation;

        const runPhase = async () => {
            const { currentNodeId, characterIndex, type } = step;
            const currentNode = nodes.find((n) => n.id === currentNodeId);

            // ── Fase "state" ──────────────────────────────────────────────────
            if (type === "state") {
                let spent = 0;

                if (currentNode?.action) {
                    spent = await runCommands(
                        currentNode.action,
                        simulationSpeed,
                        isCurrent,
                        gameDispatch,
                        setCurrentCommand,
                    );
                    if (!isCurrent()) return;
                }

                onEnterRef.current?.(currentNodeId!);

                await delay(Math.max(0, simulationSpeed - spent));
                if (!isCurrent()) return;

                if (characterIndex >= inputWord.length) {
                    if (currentNode?.isFinal) {
                        setStatus("accepted");
                    } else {
                        setStatus("rejected");
                        setStep((prev) => (prev ? { ...prev, failed: true } : null));
                    }
                    return;
                }

                setStep((prev) => (prev ? { ...prev, type: "transition" } : null));
                return;
            }

            // ── Fase "transition" ─────────────────────────────────────────────
            if (characterIndex >= inputWord.length) {
                if (currentNode?.isFinal) {
                    setStatus("accepted");
                } else {
                    setStatus("rejected");
                    setStep((prev) => (prev ? { ...prev, failed: true } : null));
                }
                return;
            }

            const symbol = inputWord[characterIndex].toLowerCase();
            const transition = edges.find(
                (e) => e.source === currentNodeId && e.label.toLowerCase() === symbol,
            );

            if (!transition) {
                setStatus("rejected");
                setStep((prev) => (prev ? { ...prev, failed: true, activeEdgeId: null } : null));
                return;
            }

            onExitRef.current?.(currentNodeId!);
            onStartRef.current?.(transition.id, currentNodeId!, transition.target, symbol);
            onEndRef.current?.(transition.id, currentNodeId!, transition.target, symbol);

            let spent = 0;
            if (transition.action) {
                spent = await runCommands(
                    transition.action,
                    simulationSpeed,
                    isCurrent,
                    gameDispatch,
                    setCurrentCommand,
                );
                if (!isCurrent()) return;
            }

            await delay(Math.max(0, simulationSpeed - spent));
            if (!isCurrent()) return;

            setStep({
                currentNodeId: transition.target,
                activeEdgeId: transition.id,
                characterIndex: characterIndex + 1,
                failed: false,
                type: "state",
            });
        };

        runPhase();

        return () => {
            generationRef.current++;
        };
    }, [status, step, inputWord, nodes, edges, simulationSpeed]);

    // --- Controles ---

    const play = () => {
        const initialNode = nodes.find((n) => n.isInitial);
        if (!initialNode) {
            showAlert("Defina um estado inicial antes de iniciar a simulação.");
            return;
        }
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
        setCurrentCommand("");
        setStatus("running");
        setStep({
            currentNodeId: initialNode.id,
            activeEdgeId: null,
            characterIndex: 0,
            failed: false,
            type: "state",
        });
    };

    const stop = () => {
        generationRef.current++;
        setStatus("idle");
        setStep(null);
        setCurrentCommand("");
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
    };

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

    return { inputWord, setInputWord, status, step, play, stop, getStatusMessage };
}
