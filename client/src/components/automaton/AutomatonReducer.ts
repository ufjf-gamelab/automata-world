/**
 * AutomatonReducer.ts — Estrutura de dados e reducer do grafo do autômato
 *
 * Define os tipos Node (estado) e Edge (transição), além do reducer que
 * processa todas as mutações do grafo: arrastar nós, adicionar/remover
 * estados e transições, importar/exportar, e reorganizar o layout.
 *
 * O layout automático usa a biblioteca `dagre`, que calcula posições
 * hierárquicas para grafos direcionados.
 */
import * as dagre from "dagre";

// --- Tipos do grafo ---

export interface Node {
    id: string;
    label: string; // texto exibido dentro do círculo (id do estado)
    x: number;
    y: number;
    isInitial?: boolean;
    isFinal?: boolean;
    action?: string; // sequência de comandos do jogo executada ao entrar neste estado (ex: "fn")
}

export interface Edge {
    id: string;
    source: string; // id do nó de origem
    target: string; // id do nó de destino
    label: string; // símbolo lido na fita (qualquer letra do alfabeto)
    action?: string; // sequência de comandos do jogo executada ao percorrer esta aresta (ex: "fb")
}

export const NODE_WIDTH = 60;
export const NODE_HEIGHT = 60;

// --- Layout automático com dagre ---

/**
 * Calcula as posições x/y de cada nó usando o algoritmo de layout hierárquico
 * da biblioteca dagre (esquerda → direita). Após o layout, verifica pares
 * bidirecionais (A↔B) e garante que a distância mínima entre eles seja
 * suficiente para as curvas das arestas não se sobreporem.
 */
export const getLayout = (nodesToLayout: Node[], edgesToLayout: Edge[]): Node[] => {
    if (nodesToLayout.length === 0) return nodesToLayout;

    // Monta o grafo dagre e calcula o layout
    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "LR", nodesep: 100, ranksep: 180, edgesep: 60 });
    g.setDefaultEdgeLabel(() => ({}));

    nodesToLayout.forEach((node) =>
        g.setNode(node.id, { label: node.label, width: NODE_WIDTH, height: NODE_HEIGHT }),
    );
    edgesToLayout.forEach((edge) => g.setEdge(edge.source, edge.target, {}, edge.id));
    dagre.layout(g);

    const laid = nodesToLayout.map((node) => {
        const pos = g.node(node.id);
        if (!pos) return { ...node, x: node.x ?? 0, y: node.y ?? 0 };
        return { ...node, x: pos.x, y: pos.y };
    });

    // Garante distância mínima entre pares bidirecionais para as curvas terem espaço
    const MIN_BIDIR_DIST = 160;
    const nodeMap = new Map(laid.map((n) => [n.id, { ...n }]));

    const bidirPairs = new Set<string>();
    edgesToLayout.forEach((e) => {
        const reverse = edgesToLayout.find((r) => r.source === e.target && r.target === e.source);
        if (reverse) bidirPairs.add([e.source, e.target].sort().join("↔"));
    });

    bidirPairs.forEach((key) => {
        const [idA, idB] = key.split("↔");
        const a = nodeMap.get(idA);
        const b = nodeMap.get(idB);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_BIDIR_DIST) {
            // Empurra os dois nós para longe um do outro a partir do ponto médio
            const scale = MIN_BIDIR_DIST / Math.max(dist, 1);
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            nodeMap.set(idA, {
                ...a,
                x: midX + (a.x - midX) * scale,
                y: midY + (a.y - midY) * scale,
            });
            nodeMap.set(idB, {
                ...b,
                x: midX + (b.x - midX) * scale,
                y: midY + (b.y - midY) * scale,
            });
        }
    });

    return Array.from(nodeMap.values());
};

// --- Estado e ações do grafo ---

export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    nodeCounter: number; // contador usado para gerar IDs únicos sequenciais
}

/** Todas as ações que podem modificar o grafo do autômato */
export type GraphAction =
    | { type: "DRAG_NODE"; id: string; x: number; y: number }
    | { type: "ADD_NODE_AND_EDGE"; sourceId: string; label: string; action?: string }
    | { type: "ADD_EDGE"; sourceId: string; targetId: string; label: string; action?: string }
    | { type: "EDIT_EDGE"; edgeId: string; label: string; action?: string }
    | { type: "SET_NODE_ACTION"; nodeId: string; action?: string }
    | { type: "DELETE_NODE"; nodeId: string }
    | { type: "DELETE_EDGE"; edgeId: string }
    | { type: "SET_INITIAL"; nodeId: string }
    | { type: "TOGGLE_FINAL"; nodeId: string }
    | { type: "RELAYOUT" }
    | { type: "LOAD"; nodes: Node[]; edges: Edge[] };

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
    switch (action.type) {
        // Atualiza a posição de um nó durante o arrasto
        case "DRAG_NODE":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.id ? { ...n, x: action.x, y: action.y } : n,
                ),
            };

        // Cria um novo nó e já o conecta ao nó de origem com uma aresta
        case "ADD_NODE_AND_EDGE": {
            const newId = `${state.nodeCounter}`;
            const isDuplicate = state.edges.some(
                (e) =>
                    e.source === action.sourceId && e.target === newId && e.label === action.label,
            );
            if (isDuplicate) return state;
            const sourceNode = state.nodes.find((n) => n.id === action.sourceId);
            const newNode: Node = {
                id: newId,
                label: newId,
                x: sourceNode ? sourceNode.x + 180 : 200,
                y: sourceNode ? sourceNode.y : 200,
            };
            const newEdge: Edge = {
                id: crypto.randomUUID(),
                source: action.sourceId,
                target: newId,
                label: action.label,
                action: action.action,
            };
            return {
                nodes: [...state.nodes, newNode],
                edges: [...state.edges, newEdge],
                nodeCounter: state.nodeCounter + 1,
            };
        }

        // Conecta dois nós existentes com uma nova aresta
        case "ADD_EDGE": {
            const isDuplicate = state.edges.some(
                (e) =>
                    e.source === action.sourceId &&
                    e.target === action.targetId &&
                    e.label === action.label,
            );
            if (isDuplicate) return state;
            const newEdge: Edge = {
                id: crypto.randomUUID(),
                source: action.sourceId,
                target: action.targetId,
                label: action.label,
                action: action.action,
            };
            return { ...state, edges: [...state.edges, newEdge] };
        }

        // Atualiza o símbolo e/ou a ação de uma aresta existente
        case "EDIT_EDGE":
            return {
                ...state,
                edges: state.edges.map((e) =>
                    e.id === action.edgeId
                        ? { ...e, label: action.label, action: action.action }
                        : e,
                ),
            };

        // Define ou remove a sequência de ações de entrada de um estado
        case "SET_NODE_ACTION":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.nodeId ? { ...n, action: action.action } : n,
                ),
            };

        // Remove o nó e todas as arestas que o envolvem
        case "DELETE_NODE":
            return {
                ...state,
                nodes: state.nodes.filter((n) => n.id !== action.nodeId),
                edges: state.edges.filter(
                    (e) => e.source !== action.nodeId && e.target !== action.nodeId,
                ),
            };

        case "DELETE_EDGE":
            return { ...state, edges: state.edges.filter((e) => e.id !== action.edgeId) };

        // Torna um nó o único estado inicial (desmarca os demais)
        case "SET_INITIAL":
            return {
                ...state,
                nodes: state.nodes.map((n) => ({ ...n, isInitial: n.id === action.nodeId })),
            };

        // Alterna se um nó é estado final ou não
        case "TOGGLE_FINAL":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.nodeId ? { ...n, isFinal: !n.isFinal } : n,
                ),
            };

        // Recalcula as posições de todos os nós usando dagre
        case "RELAYOUT":
            return { ...state, nodes: getLayout(state.nodes, state.edges) };

        // Substitui o grafo inteiro com dados importados de um arquivo JSON
        case "LOAD":
            return { nodes: action.nodes, edges: action.edges, nodeCounter: action.nodes.length };

        default:
            return state;
    }
}
