// Custom hook that owns the automaton simulation loop.
// Keeps AutomatonEditor focused on layout and UI concerns only.
import { useState, useEffect, useRef, useCallback } from "react";
import type { Dispatch } from "react";
import type { Node, Edge } from "./AutomatonReducer";
import type { AnimationStatus, AnimationStep } from "./AutomatonEditorTypes";
import type { GameAction } from "../game/gameReducer";

interface UseSimulationParams {
    nodes: Node[];
    edges: Edge[];
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
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
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: UseSimulationParams) {
    const [inputWord, setInputWord] = useState("FFFFF");
    const [status, setStatus] = useState<AnimationStatus>("idle");
    const [step, setStep] = useState<AnimationStep | null>(null);
    const timeoutRef = useRef<number | null>(null);

    // Refs keep callbacks fresh inside the effect without re-subscribing
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

    // ── Simulation loop ────────────────────────────────────────────────────────
    useEffect(() => {
        if (status !== "running") {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }
        if (!step) return;

        timeoutRef.current = window.setTimeout(() => {
            const { currentNodeId, characterIndex, type } = step;

            // ── State phase: fire entry action, then decide next step ──────────
            if (type === "state") {
                const currentNode = nodes.find((n) => n.id === currentNodeId);

                if (currentNode?.action) {
                    // Execute each command in the action sequence
                    for (const ch of currentNode.action.toLowerCase()) {
                        gameDispatch({ type: "EXECUTE_ACTION", payload: ch });
                    }
                    setCurrentCommand(currentNode.action);
                }

                onEnterRef.current?.(currentNodeId!);

                if (characterIndex >= inputWord.length) {
                    if (currentNode?.isFinal) {
                        setStatus("accepted");
                    } else {
                        setStatus("rejected");
                        setStep((prev) => (prev ? { ...prev, failed: true } : null));
                    }
                    return;
                }

                // Advance to transition phase — same character index
                setStep((prev) => (prev ? { ...prev, type: "transition" } : null));
                return;
            }

            // ── Transition phase: consume one symbol and follow the edge ──────
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
            const transition = edges.find(
                (e) => e.source === currentNodeId && e.label.toLowerCase() === symbol,
            );

            if (transition) {
                onExitRef.current?.(currentNodeId!);
                onStartRef.current?.(transition.id, currentNodeId!, transition.target, symbol);
                onEndRef.current?.(transition.id, currentNodeId!, transition.target, symbol);

                if (transition.action) {
                    for (const ch of transition.action.toLowerCase()) {
                        gameDispatch({ type: "EXECUTE_ACTION", payload: ch });
                    }
                    setCurrentCommand(transition.action);
                }

                setStep({
                    currentNodeId: transition.target,
                    activeEdgeId: transition.id,
                    characterIndex: characterIndex + 1,
                    failed: false,
                    type: "state",
                });
            } else {
                setStatus("rejected");
                setStep((prev) => (prev ? { ...prev, failed: true, activeEdgeId: null } : null));
            }
        }, 750);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [status, step, inputWord, nodes, edges]);

    // ── Controls ───────────────────────────────────────────────────────────────

    const play = () => {
        const initialNode = nodes.find((n) => n.isInitial);
        if (!initialNode) {
            alert("Define an initial state before running the simulation.");
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
        setStatus("idle");
        setStep(null);
        setCurrentCommand("");
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
    };

    const getStatusMessage = useCallback(() => {
        switch (status) {
            case "running":
                return `Reading: "${inputWord}"...`;
            case "accepted":
                return `"${inputWord}" ACCEPTED!`;
            case "rejected":
                return `"${inputWord}" REJECTED!`;
            default:
                return "Ready to simulate.";
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
