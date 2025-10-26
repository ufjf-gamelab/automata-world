// src/components/AutomatonEditor.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import * as dagre from "dagre";
import GraphCanvas from "./GraphCanvas";
import SimulationPanel from "./SimulationPanel";
import TransitionModal from "./TransitionModal";
import ControlPanel from "./ControlPanel";
import ContextMenu, { MenuItem } from "./ContextMenu"; // Importa MenuItem também
import styles from "./AutomatonEditor.module.css"; // Import module

// --- DEFINIÇÕES DE TIPO (APENAS UMA VEZ) ---
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
type AnimationStatus = "idle" | "running" | "accepted" | "rejected";
interface AnimationStep {
    currentNodeId: string | null;
    activeEdgeId: string | null;
    characterIndex: number;
    failed: boolean;
}

// --- CONSTANTES DO GRAFO (APENAS UMA VEZ) ---
export const NODE_WIDTH = 60;
export const NODE_HEIGHT = 60;

// --- DADOS INICIAIS (APENAS UMA VEZ) ---
const initialNodesData: Node[] = [
    { id: "0", label: "0", x: 0, y: 0, isInitial: true },
    { id: "1", label: "1", x: 0, y: 0 },
    { id: "2", label: "2", x: 0, y: 0, isFinal: true },
];
const initialEdgesData: Edge[] = [
    { id: crypto.randomUUID(), source: "0", target: "1", label: "a" },
    { id: crypto.randomUUID(), source: "1", target: "2", label: "b" },
    { id: crypto.randomUUID(), source: "2", target: "2", label: "b" },
];

// --- FUNÇÃO DE LAYOUT (APENAS UMA VEZ) ---
const getLayout = (nodesToLayout: Node[], edgesToLayout: Edge[]): Node[] => {
    if (typeof dagre === "undefined") {
        console.error("Dagre não está carregado.");
        return nodesToLayout;
    }
    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "LR", nodesep: 70, ranksep: 120 });
    g.setDefaultEdgeLabel(() => ({}));
    nodesToLayout.forEach((node) => {
        g.setNode(node.id, { label: node.label, width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edgesToLayout.forEach((edge) => {
        g.setEdge(edge.source, edge.target, {}, edge.id);
    });
    dagre.layout(g);
    return nodesToLayout.map((node) => {
        const nodeWithPosition = g.node(node.id);
        if (!nodeWithPosition) return { ...node, x: node.x || 0, y: node.y || 0 };
        return {
            ...node,
            x: nodeWithPosition.x,
            y: nodeWithPosition.y,
        };
    });
};

// --- TIPOS DE MENU (APENAS UMA VEZ) ---
interface ContextMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedNodeId: string | null;
}
interface EdgeMenuData {
    visible: boolean;
    x: number;
    y: number;
    selectedEdge: Edge | null;
}
interface LinkingState {
    sourceNode: Node | null;
}

// --- TIPO DE ESTADO PARA O MODAL (APENAS UMA VEZ) ---
type ModalAction = "add" | "edit" | "link";
interface ModalData {
    isOpen: boolean;
    action: ModalAction | null;
    sourceId?: string;
    targetId?: string;
    edgeToEdit?: Edge;
    title: string;
}

// --- COMPONENTE PRINCIPAL DO EDITOR ---
function AutomatonEditor() {
    // --- ESTADOS ---
    const [nodes, setNodes] = useState<Node[]>(() => getLayout(initialNodesData, initialEdgesData));
    const [edges, setEdges] = useState<Edge[]>(initialEdgesData);
    const [nodeCounter, setNodeCounter] = useState(nodes.length);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [recenterTrigger, setRecenterTrigger] = useState(1);
    const [isSimPanelOpen, setSimPanelOpen] = useState(true);
    const [contextMenu, setContextMenu] = useState<ContextMenuData>({
        visible: false,
        x: 0,
        y: 0,
        selectedNodeId: null,
    });
    const [edgeMenu, setEdgeMenu] = useState<EdgeMenuData>({
        visible: false,
        x: 0,
        y: 0,
        selectedEdge: null,
    });
    const [linkingState, setLinkingState] = useState<LinkingState>({ sourceNode: null });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [inputWord, setInputWord] = useState("ab");
    const [animationStatus, setAnimationStatus] = useState<AnimationStatus>("idle");
    const [animationStep, setAnimationStep] = useState<AnimationStep | null>(null);
    const animationTimeoutRef = useRef<number | null>(null);
    const [modalData, setModalData] = useState<ModalData>({ isOpen: false, action: null, title: "" });
    const menuRef = useRef<HTMLDivElement>(null);

    // --- LÓGICA DA ANIMAÇÃO ---
    useEffect(() => {
        if (animationStatus !== "running" && animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
            return;
        }
        if (animationStatus === "running" && animationStep) {
            animationTimeoutRef.current = window.setTimeout(() => {
                const { currentNodeId, characterIndex } = animationStep;
                if (characterIndex >= inputWord.length) {
                    const currentNode = nodes.find((n) => n.id === currentNodeId);
                    if (currentNode?.isFinal) {
                        setAnimationStatus("accepted");
                    } else {
                        setAnimationStatus("rejected");
                        setAnimationStep((prev) => (prev ? { ...prev, failed: true } : null));
                    }
                    return;
                }
                const currentChar = inputWord[characterIndex];
                const transition = edges.find((e) => e.source === currentNodeId && e.label === currentChar);
                if (transition) {
                    setAnimationStep({
                        currentNodeId: transition.target,
                        activeEdgeId: transition.id,
                        characterIndex: characterIndex + 1,
                        failed: false,
                    });
                } else {
                    setAnimationStatus("rejected");
                    setAnimationStep((prev) => (prev ? { ...prev, failed: true, activeEdgeId: null } : null));
                }
            }, 750);
        }
        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [animationStatus, animationStep, inputWord, nodes, edges]);

    // --- HANDLERS (DEFINIDOS APENAS UMA VEZ) ---
    const handlePlayAnimation = () => {
        const initialNode = nodes.find((n) => n.isInitial);
        if (!initialNode) {
            return alert("Defina um estado inicial para começar a simulação.");
        }
        setAnimationStatus("running");
        setAnimationStep({
            currentNodeId: initialNode.id,
            activeEdgeId: null,
            characterIndex: 0,
            failed: false,
        });
    };

    const handleStopAnimation = () => {
        setAnimationStatus("idle");
        setAnimationStep(null);
    };

    const closeMenuAndReset = () => {
        setContextMenu({ visible: false, x: 0, y: 0, selectedNodeId: null });
        setEdgeMenu({ visible: false, x: 0, y: 0, selectedEdge: null });
        setLinkingState({ sourceNode: null });
    };

    const handleNodeDrag = (id: string, newX: number, newY: number) => {
        setNodes((currentNodes) => currentNodes.map((node) => (node.id === id ? { ...node, x: newX, y: newY } : node)));
    };

    const handleSvgClick = () => {
        closeMenuAndReset();
    };

    const handleSvgMouseMove = (x: number, y: number) => {
        if (!linkingState.sourceNode) return;
        setMousePosition({ x, y });
    };

    const calculateMenuPosition = (
        clickX: number,
        clickY: number,
        menuHeight: number | undefined
    ): { x: number; y: number } => {
        const padding = 10;
        let x = clickX + padding;
        let y = clickY + padding;
        const menuWidth = 220;
        const currentMenuHeight = menuHeight || 200;
        if (x + menuWidth > window.innerWidth - padding) {
            x = window.innerWidth - menuWidth - padding;
        }
        if (x < padding) {
            x = padding;
        }
        if (y + currentMenuHeight > window.innerHeight - padding) {
            y = window.innerHeight - currentMenuHeight - padding;
        }
        if (y < padding) {
            y = padding;
        }
        return { x, y };
    };

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        closeMenuAndReset();
        if (linkingState.sourceNode) {
            setModalData({
                isOpen: true,
                action: "link",
                sourceId: linkingState.sourceNode.id,
                targetId: node.id,
                title: `Nova Transição (${linkingState.sourceNode.id} → ${node.id})`,
            });
            setLinkingState({ sourceNode: null });
        } else {
            const { x, y } = calculateMenuPosition(event.clientX, event.clientY, menuRef.current?.clientHeight);
            setContextMenu({ visible: true, x, y, selectedNodeId: node.id });
        }
    };

    const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        closeMenuAndReset();
        const { x, y } = calculateMenuPosition(event.clientX, event.clientY, menuRef.current?.clientHeight);
        setEdgeMenu({ visible: true, x, y, selectedEdge: edge });
    };

    const handleAddNewStateAndLink = () => {
        const sourceId = contextMenu.selectedNodeId;
        if (!sourceId) return;
        setModalData({
            isOpen: true,
            action: "add",
            sourceId: sourceId,
            title: `Nova Transição (${sourceId} → Novo Estado)`,
        });
        closeMenuAndReset();
    };

    const handleOpenEditEdgeModal = () => {
        const edge = edgeMenu.selectedEdge;
        if (!edge) return;
        setModalData({
            isOpen: true,
            action: "edit",
            edgeToEdit: edge,
            title: `Editar Transição (${edge.source} - ${edge.label} → ${edge.target})`,
        });
        closeMenuAndReset();
    };

    const handleModalSubmit = (label: string) => {
        const { action, sourceId, targetId, edgeToEdit } = modalData;
        if (action === "add" && sourceId) {
            const newId = `${nodeCounter}`;
            const isDuplicate = edges.some((e) => e.source === sourceId && e.target === newId && e.label === label);
            if (isDuplicate) {
                alert(`Erro: A transição (${sourceId} -${label}-> ${newId}) já existe.`);
                return;
            }
            const sourceNode = nodes.find((n) => n.id === sourceId);
            const newNode: Node = {
                id: newId,
                label: newId,
                x: sourceNode ? sourceNode.x + 150 : 200,
                y: sourceNode ? sourceNode.y : 200,
            };
            const newEdge: Edge = { id: crypto.randomUUID(), source: sourceId, target: newId, label };
            setNodes([...nodes, newNode]);
            setEdges([...edges, newEdge]);
            setNodeCounter((c) => c + 1);
        } else if (action === "link" && sourceId && targetId) {
            const isDuplicate = edges.some((e) => e.source === sourceId && e.target === targetId && e.label === label);
            if (isDuplicate) {
                alert(`Erro: A transição (${sourceId} -${label}-> ${targetId}) já existe.`);
                return;
            }
            const newEdge: Edge = { id: crypto.randomUUID(), source: sourceId, target: targetId, label };
            setEdges([...edges, newEdge]);
        } else if (action === "edit" && edgeToEdit) {
            if (label === edgeToEdit.label) {
                setModalData({ isOpen: false, action: null, title: "" });
                return;
            }
            const isDuplicate = edges.some(
                (e) =>
                    e.id !== edgeToEdit.id &&
                    e.source === edgeToEdit.source &&
                    e.target === edgeToEdit.target &&
                    e.label === label
            );
            if (isDuplicate) {
                alert(`Erro: A transição (${edgeToEdit.source} -${label}-> ${edgeToEdit.target}) já existe.`);
                return;
            }
            setEdges(edges.map((e) => (e.id === edgeToEdit.id ? { ...e, label } : e)));
        }
        setModalData({ isOpen: false, action: null, title: "" });
        closeMenuAndReset();
    };

    const handleStartLinking = () => {
        const sourceNode = nodes.find((n) => n.id === contextMenu.selectedNodeId);
        if (!sourceNode) return;
        setLinkingState({ sourceNode });
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleDeleteNode = () => {
        const nodeId = contextMenu.selectedNodeId;
        if (!nodeId) return;
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
        closeMenuAndReset();
    };

    const handleDeleteEdge = () => {
        if (!edgeMenu.selectedEdge) return;
        setEdges((prev) => prev.filter((e) => e.id !== edgeMenu.selectedEdge!.id));
        closeMenuAndReset();
    };

    const handleSetInitialState = useCallback(() => {
        const nodeId = contextMenu.selectedNodeId;
        if (!nodeId) return;
        setNodes(nodes.map((n) => ({ ...n, isInitial: n.id === nodeId })));
        closeMenuAndReset();
    }, [nodes, contextMenu.selectedNodeId]);

    const handleToggleFinalState = useCallback(() => {
        const nodeId = contextMenu.selectedNodeId;
        if (!nodeId) return;
        setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, isFinal: !n.isFinal } : n)));
        closeMenuAndReset();
    }, [nodes, contextMenu.selectedNodeId]);

    const handleRelayout = () => {
        setNodes(getLayout(nodes, edges));
        setRecenterTrigger((c) => c + 1);
        closeMenuAndReset();
    };

    const handleExport = useCallback(() => {
        const nodesToExport = nodes.map(({ x, y, ...rest }) => rest);
        const data = JSON.stringify({ nodes: nodesToExport, edges }, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "automaton.json";
        a.click();
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== "string") throw new Error("O ficheiro não é válido.");
                const data = JSON.parse(result);
                if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
                    throw new Error("JSON em formato inválido. Precisa das chaves 'nodes' e 'edges'.");
                }
                const nodesWithXY = data.nodes.map((n: Partial<Node>) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 } as Node));
                const nodesWithLayout = getLayout(nodesWithXY, data.edges);
                setNodes(nodesWithLayout);
                setEdges(data.edges);
                setNodeCounter(nodesWithLayout.length);
                setRecenterTrigger((c) => c + 1);
                closeMenuAndReset();
            } catch (error) {
                alert(`Erro ao importar o ficheiro: ${error}`);
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    // Função getStatusMessage (definida APENAS UMA VEZ)
    const getStatusMessage = useCallback(() => {
        switch (animationStatus) {
            case "running":
                return `Lendo: "${inputWord}"...`;
            case "accepted":
                return `Palavra "${inputWord}" ACEITA!`;
            case "rejected":
                return `Palavra "${inputWord}" REJEITADA!`;
            default:
                return "Pronto para simular.";
        }
    }, [animationStatus, inputWord]);

    const sourceNodeForLinking = linkingState.sourceNode;

    // --- DEFINE OS ITENS DOS MENUS ---
    const nodeMenuItems: MenuItem[] = [
        { icon: "✨", label: "Adic. e Ligar Novo Estado", onClick: handleAddNewStateAndLink },
        { icon: "🔗", label: "Ligar a Estado Existente", onClick: handleStartLinking },
        { isSeparator: true },
        { icon: "🚩", label: "Definir como Estado Inicial", onClick: handleSetInitialState },
        { icon: "🔘", label: "Alternar Estado Final", onClick: handleToggleFinalState },
        { isSeparator: true },
        { icon: "🗑️", label: "Excluir Estado", onClick: handleDeleteNode, className: "text-red-600" },
    ];

    const edgeMenuItems: MenuItem[] = [
        { icon: "✏️", label: "Editar Símbolo", onClick: handleOpenEditEdgeModal },
        { icon: "🗑️", label: "Excluir Transição", onClick: handleDeleteEdge, className: "text-red-600" },
    ];
    // // Import ContextMenu styles to reference textRed600
    // import contextMenuStyles from "./ContextMenu.module.css";
    // --- RENDERIZAÇÃO ---
    return (
        <div className={styles.appContainer}>
            <SimulationPanel
                isSimPanelOpen={isSimPanelOpen}
                setSimPanelOpen={setSimPanelOpen}
                inputWord={inputWord}
                setInputWord={setInputWord}
                animationStatus={animationStatus}
                handlePlayAnimation={handlePlayAnimation}
                handleStopAnimation={handleStopAnimation}
                getStatusMessage={getStatusMessage}
            />

            <div className={styles.canvasWrapper} onClick={handleSvgClick}>
                <ControlPanel onRelayout={handleRelayout} onImportClick={handleImportClick} onExport={handleExport} />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    style={{ display: "none" }}
                />

                <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodeDrag={handleNodeDrag}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onSvgMouseMove={handleSvgMouseMove}
                    recenterTrigger={recenterTrigger}
                    linkingState={linkingState}
                    mousePosition={mousePosition}
                    sourceNodeForLinking={sourceNodeForLinking}
                    activeNodeId={animationStep?.currentNodeId ?? null}
                    activeEdgeId={animationStep?.activeEdgeId ?? null}
                    failedNodeId={animationStep?.failed ? animationStep.currentNodeId : null}
                    isSimulating={animationStatus === "running"}
                />

                <TransitionModal
                    isOpen={modalData.isOpen}
                    onClose={() => setModalData({ isOpen: false, action: null, title: "" })}
                    onSubmit={handleModalSubmit}
                    initialValue={modalData.action === "edit" ? modalData.edgeToEdit?.label : ""}
                    title={modalData.title}
                />
                <ContextMenu
                    isVisible={contextMenu.visible}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={nodeMenuItems}
                    menuRef={menuRef}
                />
                <ContextMenu
                    isVisible={edgeMenu.visible}
                    x={edgeMenu.x}
                    y={edgeMenu.y}
                    items={edgeMenuItems}
                    menuRef={menuRef}
                />
            </div>
        </div>
    );
}

export default AutomatonEditor;
