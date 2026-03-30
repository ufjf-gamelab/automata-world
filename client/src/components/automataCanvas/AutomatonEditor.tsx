import React, { useState, useCallback, useEffect, useRef, useReducer } from "react";
import GraphCanvas from "./GraphCanvas";
import SimulationPanel from "./SimulationPanel";
import TransitionModal from "./TransitionModal";
import ControlPanel from "./ControlPanel";
import ContextMenu, { MenuItem } from "./ContextMenu";
import GameView from "../GameView";
import styles from "./AutomatonEditor.module.css";
import { graphReducer, getLayout, type GraphState, type Node, type Edge } from "./Automatonreducer";

export type { Node, Edge } from "./Automatonreducer";
export { NODE_WIDTH, NODE_HEIGHT } from "./Automatonreducer";

const initialNodesData: Node[] = [
    { id: "0", label: "0", x: 0, y: 0, isInitial: true },
    { id: "1", label: "1", x: 0, y: 0 },
    { id: "2", label: "2", x: 0, y: 0, isFinal: true },
];
const initialEdgesData: Edge[] = [
    { id: crypto.randomUUID(), source: "0", target: "1", label: "f" },
    { id: crypto.randomUUID(), source: "1", target: "2", label: "f" },
    { id: crypto.randomUUID(), source: "2", target: "2", label: "e" },
];
const initialGraphState: GraphState = {
    nodes: getLayout(initialNodesData, initialEdgesData),
    edges: initialEdgesData,
    nodeCounter: initialNodesData.length,
};

type AnimationStatus = "idle" | "running" | "accepted" | "rejected";

interface AnimationStep {
    currentNodeId: string | null;
    activeEdgeId: string | null;
    characterIndex: number;
    failed: boolean;
}

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

type ModalAction = "add" | "edit" | "link";

interface ModalData {
    isOpen: boolean;
    action: ModalAction | null;
    sourceId?: string;
    targetId?: string;
    edgeToEdit?: Edge;
    title: string;
}

export interface AutomatonEditorProps {
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

function AutomatonEditor({
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: AutomatonEditorProps = {}) {
    const [graph, dispatch] = useReducer(graphReducer, initialGraphState);
    const { nodes, edges } = graph;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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
    const [modalData, setModalData] = useState<ModalData>({
        isOpen: false,
        action: null,
        title: "",
    });

    const [inputWord, setInputWord] = useState("ff");
    const [animationStatus, setAnimationStatus] = useState<AnimationStatus>("idle");
    const [animationStep, setAnimationStep] = useState<AnimationStep | null>(null);
    const animationTimeoutRef = useRef<number | null>(null);

    const onStartTransitionRef = useRef(onStartTransition);
    const onEndTransitionRef = useRef(onEndTransition);
    const onStateEnterRef = useRef(onStateEnter);
    const onStateExitRef = useRef(onStateExit);
    useEffect(() => {
        onStartTransitionRef.current = onStartTransition;
    }, [onStartTransition]);
    useEffect(() => {
        onEndTransitionRef.current = onEndTransition;
    }, [onEndTransition]);
    useEffect(() => {
        onStateEnterRef.current = onStateEnter;
    }, [onStateEnter]);
    useEffect(() => {
        onStateExitRef.current = onStateExit;
    }, [onStateExit]);

    const [currentCommand, setCurrentCommand] = useState("");

    useEffect(() => {
        if (animationStatus !== "running") {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            return;
        }
        if (!animationStep) return;

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

            const currentChar = inputWord[characterIndex].toLowerCase();
            const transition = edges.find(
                (e) => e.source === currentNodeId && e.label.toLowerCase() === currentChar,
            );

            if (transition) {
                onStateExitRef.current?.(currentNodeId!);
                onStartTransitionRef.current?.(
                    transition.id,
                    currentNodeId!,
                    transition.target,
                    currentChar,
                );

                setCurrentCommand(currentChar);
                setAnimationStep({
                    currentNodeId: transition.target,
                    activeEdgeId: transition.id,
                    characterIndex: characterIndex + 1,
                    failed: false,
                });

                onEndTransitionRef.current?.(
                    transition.id,
                    currentNodeId!,
                    transition.target,
                    currentChar,
                );
                onStateEnterRef.current?.(transition.target);
            } else {
                setAnimationStatus("rejected");
                setAnimationStep((prev) =>
                    prev ? { ...prev, failed: true, activeEdgeId: null } : null,
                );
            }
        }, 750);

        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [animationStatus, animationStep, inputWord, nodes, edges]);

    const handlePlayAnimation = () => {
        const initialNode = nodes.find((n) => n.isInitial);
        if (!initialNode) return alert("Defina um estado inicial para começar a simulação.");
        setCurrentCommand("");
        setAnimationStatus("running");
        setAnimationStep({
            currentNodeId: initialNode.id,
            activeEdgeId: null,
            characterIndex: 0,
            failed: false,
        });
        onStateEnterRef.current?.(initialNode.id);
    };

    const handleStopAnimation = () => {
        setAnimationStatus("idle");
        setAnimationStep(null);
        setCurrentCommand("");
    };

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

    const closeAllMenus = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0, selectedNodeId: null });
        setEdgeMenu({ visible: false, x: 0, y: 0, selectedEdge: null });
        setLinkingState({ sourceNode: null });
    }, []);

    const calculateMenuPosition = (clientX: number, clientY: number): { x: number; y: number } => {
        const padding = 10;
        const menuWidth = 220;
        const menuHeight = menuRef.current?.clientHeight ?? 200;
        let x = clientX + padding;
        let y = clientY + padding;
        if (x + menuWidth > window.innerWidth - padding)
            x = window.innerWidth - menuWidth - padding;
        if (y + menuHeight > window.innerHeight - padding)
            y = window.innerHeight - menuHeight - padding;
        if (x < padding) x = padding;
        if (y < padding) y = padding;
        return { x, y };
    };

    const handleSvgClick = () => closeAllMenus();

    const handleSvgMouseMove = (x: number, y: number) => {
        if (linkingState.sourceNode) setMousePosition({ x, y });
    };

    const handleNodeDrag = (id: string, x: number, y: number) =>
        dispatch({ type: "DRAG_NODE", id, x, y });

    const handleNodeClick = (event: React.MouseEvent | React.TouchEvent, node: Node) => {
        event.stopPropagation();
        closeAllMenus();

        if (linkingState.sourceNode) {
            setModalData({
                isOpen: true,
                action: "link",
                sourceId: linkingState.sourceNode.id,
                targetId: node.id,
                title: `Nova Transição (${linkingState.sourceNode.id} → ${node.id})`,
            });
            setLinkingState({ sourceNode: null });
            return;
        }

        let clientX: number, clientY: number;
        if ("touches" in event) {
            const touch = (event as React.TouchEvent).changedTouches[0];
            clientX = touch?.clientX ?? window.innerWidth / 2;
            clientY = touch?.clientY ?? window.innerHeight / 2;
        } else {
            clientX = (event as React.MouseEvent).clientX;
            clientY = (event as React.MouseEvent).clientY;
        }

        const { x, y } = calculateMenuPosition(clientX, clientY);
        setContextMenu({ visible: true, x, y, selectedNodeId: node.id });
    };

    const handleNodeLongPress = (event: TouchEvent, node: Node) => {
        event.stopPropagation();
        closeAllMenus();
        const touch = event.changedTouches[0];
        const clientX = touch?.clientX ?? window.innerWidth / 2;
        const clientY = touch?.clientY ?? window.innerHeight / 2;
        const { x, y } = calculateMenuPosition(clientX, clientY);
        setContextMenu({ visible: true, x, y, selectedNodeId: node.id });
    };

    const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        closeAllMenus();
        const { x, y } = calculateMenuPosition(event.clientX, event.clientY);
        setEdgeMenu({ visible: true, x, y, selectedEdge: edge });
    };

    const handleAddNewStateAndLink = () => {
        const sourceId = contextMenu.selectedNodeId;
        if (!sourceId) return;
        setModalData({
            isOpen: true,
            action: "add",
            sourceId,
            title: `Nova Transição (${sourceId} → Novo Estado)`,
        });
        closeAllMenus();
    };

    const handleStartLinking = () => {
        const sourceNode = nodes.find((n) => n.id === contextMenu.selectedNodeId);
        if (!sourceNode) return;
        setLinkingState({ sourceNode });
        setContextMenu((prev) => ({ ...prev, visible: false }));
    };

    const handleSetInitialState = useCallback(() => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "SET_INITIAL", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
    }, [contextMenu.selectedNodeId, closeAllMenus]);

    const handleToggleFinalState = useCallback(() => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "TOGGLE_FINAL", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
    }, [contextMenu.selectedNodeId, closeAllMenus]);

    const handleDeleteNode = () => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "DELETE_NODE", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
    };

    const handleOpenEditEdgeModal = () => {
        const edge = edgeMenu.selectedEdge;
        if (!edge) return;
        setModalData({
            isOpen: true,
            action: "edit",
            edgeToEdit: edge,
            title: `Editar Transição (${edge.source} -${edge.label}→ ${edge.target})`,
        });
        closeAllMenus();
    };

    const handleDeleteEdge = () => {
        if (!edgeMenu.selectedEdge) return;
        dispatch({ type: "DELETE_EDGE", edgeId: edgeMenu.selectedEdge.id });
        closeAllMenus();
    };

    const handleModalSubmit = (label: string) => {
        const { action, sourceId, targetId, edgeToEdit } = modalData;

        if (action === "add" && sourceId) {
            const newId = `${graph.nodeCounter}`;
            const isDuplicate = edges.some(
                (e) => e.source === sourceId && e.target === newId && e.label === label,
            );
            if (isDuplicate) {
                alert(`Erro: Transição (${sourceId} -${label}-> ${newId}) já existe.`);
                return;
            }
            dispatch({ type: "ADD_NODE_AND_EDGE", sourceId, label });
        } else if (action === "link" && sourceId && targetId) {
            const isDuplicate = edges.some(
                (e) => e.source === sourceId && e.target === targetId && e.label === label,
            );
            if (isDuplicate) {
                alert(`Erro: Transição (${sourceId} -${label}-> ${targetId}) já existe.`);
                return;
            }
            dispatch({ type: "ADD_EDGE", sourceId, targetId, label });
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
                    e.label === label,
            );
            if (isDuplicate) {
                alert(
                    `Erro: Transição (${edgeToEdit.source} -${label}-> ${edgeToEdit.target}) já existe.`,
                );
                return;
            }
            dispatch({ type: "EDIT_EDGE", edgeId: edgeToEdit.id, label });
        }

        setModalData({ isOpen: false, action: null, title: "" });
    };

    const handleRelayout = () => {
        dispatch({ type: "RELAYOUT" });
        setRecenterTrigger((c) => c + 1);
        closeAllMenus();
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
                if (typeof result !== "string") throw new Error("Ficheiro inválido.");
                const data = JSON.parse(result);
                if (!Array.isArray(data.nodes) || !Array.isArray(data.edges))
                    throw new Error("JSON inválido: precisa das chaves 'nodes' e 'edges'.");
                const nodesWithXY = data.nodes.map(
                    (n: Partial<Node>) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }) as Node,
                );
                const laidOut = getLayout(nodesWithXY, data.edges);
                dispatch({ type: "LOAD", nodes: laidOut, edges: data.edges });
                setRecenterTrigger((c) => c + 1);
                closeAllMenus();
            } catch (error) {
                alert(`Erro ao importar: ${error}`);
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const nodeMenuItems: MenuItem[] = [
        { icon: "✨", label: "Adic. e Ligar Novo Estado", onClick: handleAddNewStateAndLink },
        { icon: "🔗", label: "Ligar a Estado Existente", onClick: handleStartLinking },
        { isSeparator: true },
        { icon: "🚩", label: "Definir como Estado Inicial", onClick: handleSetInitialState },
        { icon: "🔘", label: "Alternar Estado Final", onClick: handleToggleFinalState },
        { isSeparator: true },
        {
            icon: "🗑️",
            label: "Excluir Estado",
            onClick: handleDeleteNode,
            className: "text-red-600",
        },
    ];

    const edgeMenuItems: MenuItem[] = [
        { icon: "✏️", label: "Editar Símbolo", onClick: handleOpenEditEdgeModal },
        {
            icon: "🗑️",
            label: "Excluir Transição",
            onClick: handleDeleteEdge,
            className: "text-red-600",
        },
    ];

    return (
        <div className={styles.appContainer}>
            <div className={styles.automatonSection}>
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
                    <ControlPanel
                        onRelayout={handleRelayout}
                        onImportClick={handleImportClick}
                        onExport={handleExport}
                    />

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
                        onNodeLongPress={handleNodeLongPress}
                        onEdgeClick={handleEdgeClick}
                        onSvgMouseMove={handleSvgMouseMove}
                        recenterTrigger={recenterTrigger}
                        linkingState={linkingState}
                        mousePosition={mousePosition}
                        sourceNodeForLinking={linkingState.sourceNode}
                        activeNodeId={animationStep?.currentNodeId ?? null}
                        activeEdgeId={animationStep?.activeEdgeId ?? null}
                        failedNodeId={animationStep?.failed ? animationStep.currentNodeId : null}
                        isSimulating={animationStatus === "running"}
                    />

                    <TransitionModal
                        isOpen={modalData.isOpen}
                        onClose={() => setModalData({ isOpen: false, action: null, title: "" })}
                        onSubmit={handleModalSubmit}
                        initialValue={
                            modalData.action === "edit" ? modalData.edgeToEdit?.label : ""
                        }
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

            <div className={styles.gameWrapper}>
                <GameView externalCommand={currentCommand} />
            </div>
        </div>
    );
}

export default AutomatonEditor;
