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
 *
 * CORREÇÃO DE BUG:
 * nodeCounter era definido como `nodes.length`. Se os IDs dos nós não forem
 * sequenciais a partir de 0 (ex: usuário criou nós com id "1", "2", "3"),
 * o próximo gerado seria "1", causando colisão de ID → nó some e aresta
 * vira self-loop. A correção calcula max(id numérico) + 1.
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

    // Garante que o próximo ID gerado nunca colide com um existente
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
