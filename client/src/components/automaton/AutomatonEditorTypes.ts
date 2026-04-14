/**
 * AutomatonEditorTypes.ts — Tipos internos e estado inicial do AutomatonEditor
 *
 * Centraliza todas as interfaces usadas pelo editor e pela simulação,
 * evitando que o AutomatonEditor.tsx fique sobrecarregado com definições de tipo.
 * Também define o grafo inicial exibido ao abrir o app.
 */
import { getLayout, type Node, type Edge, type GraphState } from "./AutomatonReducer";
import type { Dispatch } from "react";
import type { GameAction } from "../game/gameReducer";

// --- Tipos da simulação ---

/** Estado atual da animação do autômato */
export type AnimationStatus = "idle" | "running" | "accepted" | "rejected";

/**
 * Representa um passo da simulação em andamento.
 * A simulação alterna entre duas fases a cada tick:
 *   "state"      → executa a ação de entrada do nó atual
 *   "transition" → lê o próximo símbolo da fita e segue a aresta correspondente
 */
export interface AnimationStep {
    currentNodeId: string | null; // nó onde o autômato está no momento
    activeEdgeId: string | null; // aresta que acabou de ser percorrida (para destacar)
    characterIndex: number; // índice do próximo caractere a ser lido na palavra
    failed: boolean; // true quando não há transição válida (rejeição)
    type: "transition" | "state"; // qual fase do ciclo de simulação está ativa
}

// --- Tipos de UI ---

/** Dados do menu de contexto que aparece ao clicar num nó */
export interface ContextMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedNodeId: string | null;
}

/** Dados do menu de contexto que aparece ao clicar numa aresta */
export interface EdgeMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedEdge: Edge | null;
}

/**
 * Estado do modo de conexão entre nós.
 * Quando o usuário escolhe "Ligar a Estado Existente", o sourceNode é preenchido
 * e o próximo clique em qualquer nó cria a aresta entre os dois.
 */
export interface LinkingState {
    sourceNode: Node | null;
}

/** Tipo da ação que o modal de transição/nó está executando */
export type ModalAction = "add" | "edit" | "link" | "nodeAction";

/** Estado completo do modal de criação/edição de transições e ações de estado */
export interface ModalData {
    isOpen: boolean;
    action: ModalAction | null;
    sourceId?: string; // usado em "add" e "link"
    targetId?: string; // usado em "link"
    edgeToEdit?: Edge; // usado em "edit"
    nodeForAction?: Node; // usado em "nodeAction"
    title: string;
}

// --- Props públicas do AutomatonEditor ---

/**
 * Props que o AutomatonEditor recebe do App pai.
 * gameDispatch e setCurrentCommand são injetados porque o autômato
 * precisa controlar o jogo durante a simulação.
 * Os callbacks on* são opcionais e permitem que código externo
 * reaja a eventos da simulação.
 */
export interface AutomatonEditorProps {
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
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

// --- Grafo inicial ---

/**
 * Autômato exibido quando o app é aberto pela primeira vez.
 * Reconhece a linguagem "f+n*" (um ou mais 'f' seguidos de zero ou mais 'n'),
 * onde cada transição já tem uma ação de jogo associada.
 */
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
