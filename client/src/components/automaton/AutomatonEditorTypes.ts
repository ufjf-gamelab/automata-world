import { getLayout, type Node, type Edge, type GraphState } from "./AutomatonReducer";
import type { Dispatch } from "react";
import type { GameAction } from "../game/gameReducer";

export type AnimationStatus = "idle" | "running" | "accepted" | "rejected";

export interface AnimationStep {
    currentNodeId: string | null;
    activeEdgeId: string | null;
    characterIndex: number;
    failed: boolean;
    type: "transition" | "state";
}

export interface ContextMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedNodeId: string | null;
}

export interface EdgeMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedEdge: Edge | null;
}

export interface LinkingState {
    sourceNode: Node | null;
}

export type ModalAction = "add" | "edit" | "link" | "nodeAction";

export interface ModalData {
    isOpen: boolean;
    action: ModalAction | null;
    sourceId?: string;
    targetId?: string;
    edgeToEdit?: Edge;
    nodeForAction?: Node;
    title: string;
}

export interface AutomatonEditorProps {
    // Controle do jogo — injetados pelo App pai
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
    // Callbacks opcionais de eventos da simulação
    onStartTransition?: (
        edgeId: string,
        fromNodeId: string,
        toNodeId: string,
        symbol: string,
    ) => void;
    onEndTransition?: (
        edgeId: string,
        fromNodeId: string,
        toNodeId: string,
        symbol: string,
    ) => void;
    onStateEnter?: (nodeId: string) => void;
    onStateExit?: (nodeId: string) => void;
}

const initialNodesData: Node[] = [
    { id: "0", label: "0", x: 0, y: 0, action: "f", isInitial: true },
    { id: "1", label: "1", x: 0, y: 0, action: "f" },
    { id: "2", label: "2", x: 0, y: 0, isFinal: true, action: "f" },
];

const initialEdgesData: Edge[] = [
    { id: crypto.randomUUID(), source: "0", target: "1", label: "f", action: "f" },
    { id: crypto.randomUUID(), source: "1", target: "2", label: "f", action: "f" },
    { id: crypto.randomUUID(), source: "2", target: "2", label: "n", action: "n" },
];

export const initialGraphState: GraphState = {
    nodes: getLayout(initialNodesData, initialEdgesData),
    edges: initialEdgesData,
    nodeCounter: initialNodesData.length,
};
