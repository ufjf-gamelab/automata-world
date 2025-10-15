import React, { useState, useCallback, useEffect, useRef } from "react";
import GraphCanvas, { Node, Edge } from "./components/GraphCanvas";
import "./styles.css";

function App() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "q0", label: "q0", isInitial: true, isFinal: false },
        { id: "q1", label: "q1", isInitial: false, isFinal: true },
    ]);
    const [edges, setEdges] = useState<Edge[]>([{ id: crypto.randomUUID(), source: "q0", target: "q1", label: "a" }]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [nodeCounter, setNodeCounter] = useState(2);
    const [recenterTrigger, setRecenterTrigger] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId || null);
        setSelectedEdgeId(null);
    }, []);

    const handleEdgeClick = useCallback((edgeId: string) => {
        setSelectedEdgeId(edgeId || null);
        setSelectedNodeId(null);
    }, []);

    const handleAddNode = useCallback(() => {
        const newNodeId = `q${nodeCounter}`;
        const newNode: Node = { id: newNodeId, label: newNodeId };
        setNodes((prev) => [...prev, newNode]);
        setNodeCounter((c) => c + 1);
    }, [nodeCounter]);

    const handleAddEdge = useCallback(() => {
        const source = prompt("ID do estado de origem:");
        if (!source || !nodes.find((n) => n.id === source)) return alert("Origem inválida.");
        const target = prompt("ID do estado de destino:");
        if (!target || !nodes.find((n) => n.id === target)) return alert("Destino inválido.");
        const label = prompt("Símbolo da transição:");
        if (label === null) return;
        const newEdge: Edge = { id: crypto.randomUUID(), source, target, label };
        setEdges((prev) => [...prev, newEdge]);
    }, [nodes]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedEdgeId) {
            setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
            setSelectedEdgeId(null);
            return;
        }
        if (selectedNodeId) {
            const remainingNodes = nodes.filter((n) => n.id !== selectedNodeId);
            const idMap = new Map<string, string>();
            const reindexedNodes = remainingNodes.map((node, index) => {
                const newId = `q${index}`;
                if (node.id !== newId) idMap.set(node.id, newId);
                return { ...node, id: newId, label: newId };
            });
            const reindexedEdges = edges
                .filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
                .map((edge) => ({
                    ...edge,
                    source: idMap.get(edge.source) || edge.source,
                    target: idMap.get(edge.target) || edge.target,
                }));
            setNodes(reindexedNodes);
            setEdges(reindexedEdges);
            setNodeCounter(reindexedNodes.length);
            setSelectedNodeId(null);
        }
    }, [nodes, edges, selectedNodeId, selectedEdgeId]);

    const handleSetInitial = useCallback(() => {
        if (!selectedNodeId) return;
        setNodes(nodes.map((n) => ({ ...n, isInitial: n.id === selectedNodeId })));
    }, [nodes, selectedNodeId]);

    const handleToggleFinal = useCallback(() => {
        if (!selectedNodeId) return;
        setNodes(nodes.map((n) => (n.id === selectedNodeId ? { ...n, isFinal: !n.isFinal } : n)));
    }, [nodes, selectedNodeId]);

    const handleEditEdge = useCallback(
        (edgeId: string) => {
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) return;
            const newLabel = prompt(`Editar transição [${edge.label}]:`, edge.label);
            if (newLabel !== null) {
                setEdges(edges.map((e) => (e.id === edgeId ? { ...e, label: newLabel } : e)));
            }
        },
        [edges]
    );

    const handleRecenter = () => setRecenterTrigger((c) => c + 1);

    const handleExport = useCallback(() => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
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
                setNodes(data.nodes);
                setEdges(data.edges);
                setNodeCounter(data.nodes.length);
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
                handleRecenter();
            } catch (error) {
                alert(`Erro ao importar o ficheiro: ${error}`);
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (document.activeElement?.tagName === "INPUT") return;
            switch (event.key.toLowerCase()) {
                case "n":
                    event.preventDefault();
                    handleAddNode();
                    break;
                case "t":
                    event.preventDefault();
                    handleAddEdge();
                    break;
                case "s":
                    event.preventDefault();
                    handleSetInitial();
                    break;
                case "f":
                    event.preventDefault();
                    handleToggleFinal();
                    break;
                case "e":
                    event.preventDefault();
                    handleExport();
                    break;
                case "i":
                    event.preventDefault();
                    handleImportClick();
                    break;
                case "r":
                    event.preventDefault();
                    handleRecenter();
                    break;
            }
            if (event.key === "Delete" || event.key === "Backspace") {
                if (selectedNodeId || selectedEdgeId) {
                    event.preventDefault();
                    handleDeleteSelected();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        handleAddNode,
        handleAddEdge,
        handleDeleteSelected,
        handleSetInitial,
        handleToggleFinal,
        handleExport,
        selectedNodeId,
        selectedEdgeId,
    ]);

    return (
        <div className="app-container">
            <div className="menu">
                <h3>Editor de AFD</h3>
                <button onClick={handleAddNode}>
                    Adicionar Estado <kbd>N</kbd>
                </button>
                <button onClick={handleAddEdge}>
                    Adicionar Transição <kbd>T</kbd>
                </button>
                <button onClick={handleDeleteSelected} disabled={!selectedNodeId && !selectedEdgeId} className="danger">
                    Remover <kbd>Delete</kbd>
                </button>
                <button onClick={handleSetInitial} disabled={!selectedNodeId}>
                    Definir Inicial <kbd>S</kbd>
                </button>
                <button onClick={handleToggleFinal} disabled={!selectedNodeId}>
                    Alternar Final <kbd>F</kbd>
                </button>
                <button onClick={handleRecenter} className="recenter-button">
                    Recentralizar <kbd>R</kbd>
                </button>
                <button onClick={handleImportClick} className="import-button">
                    Importar JSON <kbd>I</kbd>
                </button>
                <button onClick={handleExport} className="export-button">
                    Exportar JSON <kbd>E</kbd>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    style={{ display: "none" }}
                />
                <div className="instructions">
                    <h4>Como Usar</h4>
                    <p>
                        • <b>Clique</b> para selecionar.
                    </p>
                    <p>
                        • <b>Duplo Clique</b> na transição para editar.
                    </p>
                    <p>• Use os atalhos ou os botões.</p>
                </div>
            </div>
            <GraphCanvas
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onEdgeDoubleClick={handleEditEdge}
                recenterTrigger={recenterTrigger}
            />
        </div>
    );
}

export default App;
