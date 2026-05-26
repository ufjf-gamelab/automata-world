import { useState, useEffect, useRef, useCallback } from "react";
import type { Dispatch } from "react";
import type { Node, Edge } from "./AutomatonReducer";
import type { AnimationStatus, AnimationStep } from "./AutomatonEditorTypes";
import type { GameAction } from "../game/gameReducer";
import { countTotalButtons } from "../game/gameReducer";
import { CHAR_TO_COMMAND } from "../game/gameConfig";

interface UseSimulationParams {
    nodes: Node[];
    edges: Edge[];
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
    simulationSpeed: number;
    activeButtons: string[];
    activeStageFloor: string;
    showAlert: (message: string) => void;
    onStartTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onEndTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onStateEnter?: (nodeId: string) => void;
    onStateExit?: (nodeId: string) => void;
}

export const ANIM_DURATION: Record<string, number> = {
    f: 900,
    p: 850,
    b: 750,
    e: 300,
    d: 300,
    t: 300,
    n: 300,
    s: 300,
    l: 300,
    o: 300,
};

function getAnimDuration(ch: string): number {
    return ANIM_DURATION[ch.toLowerCase()] ?? 500;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
        setCmd(CHAR_TO_COMMAND[ch] ?? ch);
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
    activeButtons,
    activeStageFloor,
    showAlert,
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: UseSimulationParams) {
    const [inputWord, setInputWord] = useState("");
    const [status, setStatus] = useState<AnimationStatus>("idle");
    const [step, setStep] = useState<AnimationStep | null>(null);
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

    const activeButtonsRef = useRef(activeButtons);
    const activeFloorRef = useRef(activeStageFloor);
    useEffect(() => {
        activeButtonsRef.current = activeButtons;
    }, [activeButtons]);
    useEffect(() => {
        activeFloorRef.current = activeStageFloor;
    }, [activeStageFloor]);

    useEffect(() => {
        if (status !== "running" || !step) return;

        const generation = ++generationRef.current;
        const isCurrent = () => generationRef.current === generation;

        const runPhase = async () => {
            const { currentNodeId, characterIndex, type } = step;
            const currentNode = nodes.find((n) => n.id === currentNodeId);

            if (type === "waiting") {
                await delay(500);
                if (!isCurrent()) return;
                setStep((prev) => (prev ? { ...prev, type: "state" } : null));
                return;
            }

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
                    resolveVictory(currentNode?.isFinal ?? false);
                    return;
                }

                setStep((prev) => (prev ? { ...prev, type: "transition" } : null));
                return;
            }

            if (type === "transition") {
                if (characterIndex >= inputWord.length) {
                    resolveVictory(currentNode?.isFinal ?? false);
                    return;
                }

                const symbol = inputWord[characterIndex].toLowerCase();
                const transition = edges.find(
                    (e) => e.source === currentNodeId && e.label.toLowerCase() === symbol,
                );

                if (!transition) {
                    setStatus("rejected");
                    setStep((prev) =>
                        prev ? { ...prev, failed: true, activeEdgeId: null } : null,
                    );
                    return;
                }

                onExitRef.current?.(currentNodeId!);
                onStartRef.current?.(transition.id, currentNodeId!, transition.target, symbol);

                setStep({
                    currentNodeId,
                    activeEdgeId: transition.id,
                    characterIndex,
                    failed: false,
                    type: "edge_action",
                    pendingEdge: {
                        id: transition.id,
                        target: transition.target,
                        action: transition.action,
                    },
                });
                return;
            }

            if (type === "edge_action" && step.pendingEdge) {
                const { target, action: edgeAction, id: edgeId } = step.pendingEdge;

                let spent = 0;
                if (edgeAction) {
                    spent = await runCommands(
                        edgeAction,
                        simulationSpeed,
                        isCurrent,
                        gameDispatch,
                        setCurrentCommand,
                    );
                    if (!isCurrent()) return;
                }

                onEndRef.current?.(
                    edgeId,
                    currentNodeId!,
                    target,
                    inputWord[characterIndex]?.toLowerCase() ?? "",
                );
                await delay(Math.max(0, simulationSpeed - spent));
                if (!isCurrent()) return;

                setStep({
                    currentNodeId: target,
                    activeEdgeId: edgeId,
                    characterIndex: characterIndex + 1,
                    failed: false,
                    type: "state",
                });
            }
        };

        runPhase();
        return () => {
            generationRef.current++;
        };
    }, [status, step, inputWord, nodes, edges, simulationSpeed]);

    const resolveVictory = (isCurrentNodeFinal: boolean) => {
        const hasFinalStates = nodes.some((n) => n.isFinal);
        const stateOk = !hasFinalStates || isCurrentNodeFinal;
        const totalButtons = countTotalButtons(activeFloorRef.current);
        const buttonsOk = totalButtons === 0 || activeButtonsRef.current.length === totalButtons;

        if (stateOk && buttonsOk) {
            gameDispatch({ type: "SET_VICTORY" });
            setStatus("accepted");
        } else {
            setStatus("rejected");
            setStep((prev) => (prev ? { ...prev, failed: true } : null));
        }
    };

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
            type: "waiting",
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
                return `"${inputWord}" ACEITA! ✓`;
            case "rejected":
                return `"${inputWord}" REJEITADA.`;
            default:
                return "Pronto para simular.";
        }
    }, [status, inputWord]);

    return { inputWord, setInputWord, status, step, play, stop, getStatusMessage };
}
