import { getLayout, type Node, type Edge, type GraphState } from "./AutomatonReducer";
import type { Dispatch } from "react";
import type { GameAction } from "../game/gameReducer";
import type { Stage } from "../game/data/types";

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
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
    /** Fase ativa — define o grafo inicial e as restrições de usabilidade */
    activeStage: Stage;
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

/**
 * Constrói o GraphState inicial a partir da fase recebida.
 * Usado como inicializador do useReducer no AutomatonEditor.
 * Se a fase não definir initialGraph, retorna um grafo vazio.
 */
export const createInitialGraphFromStage = (stage: Stage): GraphState => {
    if (!stage.initialGraph) {
        return { nodes: [], edges: [], nodeCounter: 0 };
    }

    const { nodes: nodesData, edges: edgesData } = stage.initialGraph;

    const nodes: Node[] = nodesData.map((n) => ({
        ...n,
        x: 0,
        y: 0,
    }));

    const edges: Edge[] = edgesData.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
    }));

    return {
        nodes: getLayout(nodes, edges),
        edges,
        nodeCounter: nodes.length,
    };
};