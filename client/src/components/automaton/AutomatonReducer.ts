import * as dagre from "dagre";

// --- Tipos do grafo ---

export interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    isInitial?: boolean;
    isFinal?: boolean;
    action?: string;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
    action?: string;
}

export const NODE_WIDTH = 60;
export const NODE_HEIGHT = 60;

// --- Layout automático com dagre ---

export const getLayout = (nodesToLayout: Node[], edgesToLayout: Edge[]): Node[] => {
    if (nodesToLayout.length === 0) return nodesToLayout;

    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120, edgesep: 60 });
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

    const MIN_BIDIR_DIST = 120;
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
    nodeCounter: number;
}

/**
 * Retorna o menor inteiro positivo (≥ 1) ainda não usado como id.
 * Preenche lacunas antes de avançar:
 *   [1,2,3] → 4 | [1,3,4] → 2 | [4,5] → 1
 */
function nextAvailableId(nodes: Node[]): string {
    const used = new Set(nodes.map((n) => parseInt(n.id, 10)).filter((n) => !isNaN(n) && n > 0));
    let candidate = 1;
    while (used.has(candidate)) candidate++;
    return String(candidate);
}

export type GraphAction =
    | { type: "DRAG_NODE"; id: string; x: number; y: number }
    | { type: "ADD_FIRST_NODE"; x: number; y: number }
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
        case "DRAG_NODE":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.id ? { ...n, x: action.x, y: action.y } : n,
                ),
            };

        case "ADD_FIRST_NODE": {
            const id = "1";
            const newNode: Node = { id, label: id, x: action.x, y: action.y, isInitial: true };
            return { ...state, nodes: [newNode], edges: [], nodeCounter: 0 };
        }

        case "ADD_NODE_AND_EDGE": {
            const newId = nextAvailableId(state.nodes);
            const duplicate = state.edges.some(
                (e) =>
                    e.source === action.sourceId && e.target === newId && e.label === action.label,
            );
            if (duplicate) return state;
            const sourceNode = state.nodes.find((n) => n.id === action.sourceId);
            const newNode: Node = {
                id: newId,
                label: newId,
                x: sourceNode ? sourceNode.x + 150 : 200,
                y: sourceNode ? sourceNode.y : 200,
            };
            const newEdge: Edge = {
                id: crypto.randomUUID(),
                source: action.sourceId,
                target: newId,
                label: action.label,
                action: action.action,
            };
            const newNodes = [...state.nodes, newNode];
            const newEdges = [...state.edges, newEdge];
            return {
                ...state,
                nodes: getLayout(newNodes, newEdges),
                edges: newEdges,
            };
        }

        case "ADD_EDGE": {
            const duplicate = state.edges.some(
                (e) =>
                    e.source === action.sourceId &&
                    e.target === action.targetId &&
                    e.label === action.label,
            );
            if (duplicate) return state;
            const newEdge: Edge = {
                id: crypto.randomUUID(),
                source: action.sourceId,
                target: action.targetId,
                label: action.label,
                action: action.action,
            };
            return { ...state, edges: [...state.edges, newEdge] };
        }

        case "EDIT_EDGE":
            return {
                ...state,
                edges: state.edges.map((e) =>
                    e.id === action.edgeId
                        ? { ...e, label: action.label, action: action.action }
                        : e,
                ),
            };

        case "SET_NODE_ACTION":
            return {
                ...state,
                nodes: state.nodes.map((n) =>
                    n.id === action.nodeId ? { ...n, action: action.action } : n,
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
            return { nodes: action.nodes, edges: action.edges, nodeCounter: 0 };

        default:
            return state;
    }
}
