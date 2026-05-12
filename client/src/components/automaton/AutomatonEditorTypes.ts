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
    /**
     * waiting     — 2s de espera após reset antes de iniciar
     * state       — autômato entrou num estado; executa ação do nó
     * transition  — lê símbolo da fita; encontra aresta; destaca aresta
     * edge_action — aresta já destacada; executa ação e avança para próximo estado
     */
    type: "waiting" | "state" | "transition" | "edge_action";
    /** Preenchido apenas na fase edge_action */
    pendingEdge?: { id: string; target: string; action?: string };
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
    activeStage: Stage;
    /** Botões ativos no momento — usado para checar vitória no fim da fita */
    activeButtons: string[];
    onStartTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onEndTransition?: (edgeId: string, from: string, to: string, symbol: string) => void;
    onStateEnter?: (nodeId: string) => void;
    onStateExit?: (nodeId: string) => void;
}

const initialNodesData: Node[] = [
    { id: "0", label: "0", x: 0, y: 0, isInitial: true },
    { id: "1", label: "1", x: 0, y: 0, isFinal: true },
];

const initialEdgesData: Edge[] = [];

export const initialGraphState: GraphState = {
    nodes: getLayout(initialNodesData, initialEdgesData),
    edges: initialEdgesData,
    nodeCounter: initialNodesData.length,
};

/**
 * Constrói GraphState a partir da fase.
 * nodeCounter é baseado no maior id numérico existente para evitar colisão.
 */
export const createInitialGraphFromStage = (stage: Stage): GraphState => {
    if (!stage.initialGraph) {
        return { nodes: [], edges: [], nodeCounter: 0 };
    }

    const { nodes: nodesData, edges: edgesData } = stage.initialGraph;

    const nodes: Node[] = nodesData.map((n) => ({ ...n, x: 0, y: 0 }));
    const edges: Edge[] = edgesData.map((e) => ({ ...e, id: crypto.randomUUID() }));

    const maxNumericId = nodes.reduce((max, n) => {
        const numeric = parseInt(n.id, 10);
        return isNaN(numeric) ? max : Math.max(max, numeric);
    }, -1);

    return {
        nodes: getLayout(nodes, edges),
        edges,
        nodeCounter: maxNumericId + 1,
    };
};
