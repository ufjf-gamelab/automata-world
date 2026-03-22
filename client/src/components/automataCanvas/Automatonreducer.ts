import * as dagre from "dagre";

export interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    isInitial?: boolean;
    isFinal?: boolean;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
}

export const NODE_WIDTH = 60;
export const NODE_HEIGHT = 60;

export const getLayout = (nodesToLayout: Node[], edgesToLayout: Edge[]): Node[] => {
    if (nodesToLayout.length === 0) return nodesToLayout;

    const g = new dagre.graphlib.Graph({ multigraph: true });

    // Espaçamento para arestas curvas terem espaço
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

    // Separar pares bidirecionais
    //
    // Quando A↔B existem, as arestas curvam para lados opostos.
    const MIN_BIDIR_DIST = 160; // px mínimo entre nós com aresta bidirecional

    const nodeMap = new Map(laid.map((n) => [n.id, { ...n }]));

    // Coleta pares bidirecionais únicos (apenas uma direção)
    const bidirPairs = new Set<string>();
    edgesToLayout.forEach((e) => {
        const reverse = edgesToLayout.find((r) => r.source === e.target && r.target === e.source);
        if (reverse) {
            const key = [e.source, e.target].sort().join("↔");
            bidirPairs.add(key);
        }
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
            // Empurra os nós ao longo da direção atual para atingir MIN_BIDIR_DIST
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

export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    nodeCounter: number;
}

export type GraphAction =
    | { type: "DRAG_NODE"; id: string; x: number; y: number }
    | { type: "ADD_NODE_AND_EDGE"; sourceId: string; label: string }
    | { type: "ADD_EDGE"; sourceId: string; targetId: string; label: string }
    | { type: "EDIT_EDGE"; edgeId: string; label: string }
    | { type: "DELETE_NODE"; nodeId: string }
    | { type: "DELETE_EDGE"; edgeId: string }
    | { type: "SET_INITIAL"; nodeId: string }
    | { type: "TOGGLE_FINAL"; nodeId: string }
    | { type: "RELAYOUT" }
    | { type: "LOAD"; nodes: Node[]; edges: Edge[] };

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
    switch (action.type) {
        case "DRAG_NODE":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.id ? { ...n, x: action.x, y: action.y } : n,
                ),
            };

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
            };
            return {
                nodes: [...state.nodes, newNode],
                edges: [...state.edges, newEdge],
                nodeCounter: state.nodeCounter + 1,
            };
        }

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
            };
            return { ...state, edges: [...state.edges, newEdge] };
        }

        case "EDIT_EDGE":
            return {
                ...state,
                edges: state.edges.map((e) =>
                    e.id === action.edgeId ? { ...e, label: action.label } : e,
                ),
            };

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

        case "SET_INITIAL":
            return {
                ...state,
                nodes: state.nodes.map((n) => ({ ...n, isInitial: n.id === action.nodeId })),
            };

        case "TOGGLE_FINAL":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.nodeId ? { ...n, isFinal: !n.isFinal } : n,
                ),
            };

        case "RELAYOUT":
            return { ...state, nodes: getLayout(state.nodes, state.edges) };

        case "LOAD":
            return { nodes: action.nodes, edges: action.edges, nodeCounter: action.nodes.length };

        default:
            return state;
    }
}
