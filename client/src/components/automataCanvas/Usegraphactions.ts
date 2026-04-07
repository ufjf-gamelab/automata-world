import React, { useCallback } from "react";
import type { Dispatch, RefObject } from "react";
import { getLayout, type Node, type Edge } from "./Automatonreducer";
import type { GraphAction, GraphState } from "./Automatonreducer";
import type {
    ContextMenuData,
    EdgeMenuData,
    LinkingState,
    ModalData,
} from "./AutomatonEditorTypes";

interface UseGraphActionsParams {
    graph: GraphState;
    nodes: Node[];
    edges: Edge[];
    dispatch: Dispatch<GraphAction>;
    contextMenu: ContextMenuData;
    edgeMenu: EdgeMenuData;
    menuRef: RefObject<HTMLDivElement | null>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    setRecenterTrigger: React.Dispatch<React.SetStateAction<number>>;
    setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuData>>;
    setEdgeMenu: React.Dispatch<React.SetStateAction<EdgeMenuData>>;
    setLinkingState: React.Dispatch<React.SetStateAction<LinkingState>>;
    setMousePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    setModalData: React.Dispatch<React.SetStateAction<ModalData>>;
}

export function useGraphActions({
    graph,
    nodes,
    edges,
    dispatch,
    contextMenu,
    edgeMenu,
    menuRef,
    fileInputRef,
    setRecenterTrigger,
    setContextMenu,
    setEdgeMenu,
    setLinkingState,
    setMousePosition,
    setModalData,
}: UseGraphActionsParams) {
    const closeAllMenus = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0, selectedNodeId: null });
        setEdgeMenu({ visible: false, x: 0, y: 0, selectedEdge: null });
        setLinkingState({ sourceNode: null });
    }, [setContextMenu, setEdgeMenu, setLinkingState]);

    const calculateMenuPosition = (clientX: number, clientY: number) => {
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

    // --- Nó ---

    const handleNodeDrag = (id: string, x: number, y: number) =>
        dispatch({ type: "DRAG_NODE", id, x, y });

    const handleNodeClick = (event: React.MouseEvent | React.TouchEvent, node: Node) => {
        event.stopPropagation();
        setLinkingState((prev) => {
            if (prev.sourceNode) {
                setModalData({
                    isOpen: true,
                    action: "link",
                    sourceId: prev.sourceNode.id,
                    targetId: node.id,
                    title: `Nova Transição (${prev.sourceNode.id} → ${node.id})`,
                });
                return { sourceNode: null };
            }
            return prev;
        });
        setLinkingState((prev) => {
            if (prev.sourceNode) return prev;
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
            return prev;
        });
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

    const handleSetInitialState = useCallback(() => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "SET_INITIAL", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
    }, [contextMenu.selectedNodeId, closeAllMenus, dispatch]);

    const handleToggleFinalState = useCallback(() => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "TOGGLE_FINAL", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
    }, [contextMenu.selectedNodeId, closeAllMenus, dispatch]);

    const handleDeleteNode = () => {
        if (!contextMenu.selectedNodeId) return;
        dispatch({ type: "DELETE_NODE", nodeId: contextMenu.selectedNodeId });
        closeAllMenus();
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

    const handleSetNodeAction = () => {
        const node = nodes.find((n) => n.id === contextMenu.selectedNodeId);
        if (!node) return;
        setModalData({
            isOpen: true,
            action: "nodeAction",
            nodeForAction: node,
            title: `Ação do Estado ${node.label}`,
        });
        closeAllMenus();
    };

    // --- Aresta ---

    const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        closeAllMenus();
        const { x, y } = calculateMenuPosition(event.clientX, event.clientY);
        setEdgeMenu({ visible: true, x, y, selectedEdge: edge });
    };

    const handleOpenEditEdgeModal = () => {
        const edge = edgeMenu.selectedEdge;
        if (!edge) return;
        setModalData({
            isOpen: true,
            action: "edit",
            edgeToEdit: edge,
            title: `Editar Transição (${edge.source} -${edge.label.toUpperCase()}→ ${edge.target})`,
        });
        closeAllMenus();
    };

    const handleDeleteEdge = () => {
        if (!edgeMenu.selectedEdge) return;
        dispatch({ type: "DELETE_EDGE", edgeId: edgeMenu.selectedEdge.id });
        closeAllMenus();
    };

    // --- Modal ---

    const handleModalSubmit = (label: string, action?: string) => {
        setModalData((modal) => {
            const { action: modalAction, sourceId, targetId, edgeToEdit } = modal;

            if (modalAction === "add" && sourceId) {
                const newId = `${graph.nodeCounter}`;
                const isDuplicate = edges.some(
                    (e) => e.source === sourceId && e.target === newId && e.label === label,
                );
                if (isDuplicate) {
                    alert(`Erro: Transição (${sourceId} -${label}-> ${newId}) já existe.`);
                    return modal;
                }
                dispatch({ type: "ADD_NODE_AND_EDGE", sourceId, label, action });
            } else if (modalAction === "link" && sourceId && targetId) {
                const isDuplicate = edges.some(
                    (e) => e.source === sourceId && e.target === targetId && e.label === label,
                );
                if (isDuplicate) {
                    alert(`Erro: Transição (${sourceId} -${label}-> ${targetId}) já existe.`);
                    return modal;
                }
                dispatch({ type: "ADD_EDGE", sourceId, targetId, label, action });
            } else if (modalAction === "edit" && edgeToEdit) {
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
                    return modal;
                }
                dispatch({ type: "EDIT_EDGE", edgeId: edgeToEdit.id, label, action });
            }

            return { isOpen: false, action: null, title: "" };
        });
    };

    const handleNodeActionSubmit = (nodeAction?: string) => {
        setModalData((modal) => {
            if (modal.nodeForAction) {
                dispatch({
                    type: "SET_NODE_ACTION",
                    nodeId: modal.nodeForAction.id,
                    action: nodeAction,
                });
            }
            return { isOpen: false, action: null, title: "" };
        });
    };

    // --- Layout / Import / Export ---

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

    const handleSvgClick = () => closeAllMenus();

    const handleSvgMouseMove = (x: number, y: number) => {
        setLinkingState((prev) => {
            if (prev.sourceNode) setMousePosition({ x, y });
            return prev;
        });
    };

    return {
        closeAllMenus,
        handleNodeDrag,
        handleNodeClick,
        handleNodeLongPress,
        handleSetInitialState,
        handleToggleFinalState,
        handleDeleteNode,
        handleAddNewStateAndLink,
        handleStartLinking,
        handleSetNodeAction,
        handleEdgeClick,
        handleOpenEditEdgeModal,
        handleDeleteEdge,
        handleModalSubmit,
        handleNodeActionSubmit,
        handleRelayout,
        handleExport,
        handleImportClick,
        handleFileChange,
        handleSvgClick,
        handleSvgMouseMove,
    };
}
