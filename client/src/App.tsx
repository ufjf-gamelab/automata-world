import React, { useState, useCallback, useEffect, useRef } from 'react';
import GraphCanvas, { Node, Edge } from './components/GraphCanvas';
import './styles.css';

// Tipo para o estado da animação
type AnimationStatus = 'idle' | 'running' | 'accepted' | 'rejected';

// Tipo para o passo da animação
interface AnimationStep {
    currentNodeId: string | null;
    activeEdgeId: string | null;
    characterIndex: number;
    failed: boolean;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'q0', label: 'q0', isInitial: true },
    { id: 'q1', label: 'q1' },
    { id: 'q2', label: 'q2', isFinal: true },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: crypto.randomUUID(), source: 'q0', target: 'q1', label: 'a' },
    { id: crypto.randomUUID(), source: 'q1', target: 'q2', label: 'b' },
    { id: crypto.randomUUID(), source: 'q2', target: 'q2', label: 'b' },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [nodeCounter, setNodeCounter] = useState(nodes.length);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS PARA ANIMAÇÃO ---
  const [inputWord, setInputWord] = useState('ab');
  const [animationStatus, setAnimationStatus] = useState<AnimationStatus>('idle');
  const [animationStep, setAnimationStep] = useState<AnimationStep | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  // --- LÓGICA DA ANIMAÇÃO ---
  useEffect(() => {
    if (animationStatus !== 'running' && animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        return;
    }
    
    if (animationStatus === 'running' && animationStep) {
      animationTimeoutRef.current = window.setTimeout(() => {
        const { currentNodeId, characterIndex } = animationStep;
        
        if (characterIndex >= inputWord.length) {
          const currentNode = nodes.find(n => n.id === currentNodeId);
          if (currentNode?.isFinal) {
            setAnimationStatus('accepted');
          } else {
            setAnimationStatus('rejected');
            setAnimationStep(prev => prev ? { ...prev, failed: true } : null);
          }
          return;
        }

        const currentChar = inputWord[characterIndex];
        const transition = edges.find(e => e.source === currentNodeId && e.label === currentChar);

        if (transition) {
          setAnimationStep({
            currentNodeId: transition.target,
            activeEdgeId: transition.id,
            characterIndex: characterIndex + 1,
            failed: false,
          });
        } else {
          setAnimationStatus('rejected');
          setAnimationStep(prev => prev ? { ...prev, failed: true, activeEdgeId: null } : null);
        }
      }, 750);
    }

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [animationStatus, animationStep, inputWord, nodes, edges]);

  const handlePlayAnimation = () => {
    const initialNode = nodes.find(n => n.isInitial);
    if (!initialNode) {
      return alert("Defina um estado inicial para começar a simulação.");
    }
    setAnimationStatus('running');
    setAnimationStep({
      currentNodeId: initialNode.id,
      activeEdgeId: null,
      characterIndex: 0,
      failed: false,
    });
  };
  
  const handleStopAnimation = () => {
      setAnimationStatus('idle');
      setAnimationStep(null);
  };
  
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
    const source = prompt('ID do estado de origem:');
    if (!source || !nodes.find(n => n.id === source)) return alert('Origem inválida.');
    const target = prompt('ID do estado de destino:');
    if (!target || !nodes.find(n => n.id === target)) return alert('Destino inválido.');
    const label = prompt('Símbolo da transição:');
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
        .filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId)
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
    setNodes(nodes.map((n) => n.id === selectedNodeId ? { ...n, isFinal: !n.isFinal } : n));
  }, [nodes, selectedNodeId]);

  const handleEditEdge = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    const newLabel = prompt(`Editar transição [${edge.label}]:`, edge.label);
    if (newLabel !== null) {
      setEdges(edges.map(e => e.id === edgeId ? { ...e, label: newLabel } : e));
    }
  }, [edges]);

  const handleRecenter = () => setRecenterTrigger(c => c + 1);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automaton.json';
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
        if (typeof result !== 'string') throw new Error("O ficheiro não é válido.");
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
    event.target.value = '';
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'n': event.preventDefault(); handleAddNode(); break;
          case 't': event.preventDefault(); handleAddEdge(); break;
          case 's': event.preventDefault(); handleSetInitial(); break;
          case 'f': event.preventDefault(); handleToggleFinal(); break;
          case 'e': event.preventDefault(); handleExport(); break;
          case 'i': event.preventDefault(); handleImportClick(); break;
          case 'r': event.preventDefault(); handleRecenter(); break;
        }
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId || selectedEdgeId) {
            event.preventDefault();
            handleDeleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddNode, handleAddEdge, handleDeleteSelected, handleSetInitial, handleToggleFinal, handleExport, selectedNodeId, selectedEdgeId]);

  const getStatusMessage = () => {
    switch(animationStatus) {
        case 'running': return `Lendo: "${inputWord}"...`;
        case 'accepted': return `Palavra "${inputWord}" ACEITA!`;
        case 'rejected': return `Palavra "${inputWord}" REJEITADA!`;
        default: return 'Pronto para simular.';
    }
  };

  return (
    <div className="app-container">
      <div className="menu">
        <div className="simulation-panel">
            <h4>Simulação</h4>
            <input 
                type="text" 
                value={inputWord} 
                onChange={(e) => setInputWord(e.target.value)}
                placeholder="Palavra de entrada"
                disabled={animationStatus === 'running'}
            />
            {animationStatus !== 'running' ? (
                <button onClick={handlePlayAnimation} className="play-button">Play</button>
            ) : (
                <button onClick={handleStopAnimation} className="danger">Stop</button>
            )}
            <div className={`status-bar ${animationStatus}`}>{getStatusMessage()}</div>
        </div>
        <h3>Editor</h3>
        <button onClick={handleAddNode}>Adicionar Estado <kbd>Ctrl+N</kbd></button>
        <button onClick={handleAddEdge}>Adicionar Transição <kbd>Ctrl+T</kbd></button>
        <button onClick={handleDeleteSelected} disabled={!selectedNodeId && !selectedEdgeId} className="danger">Remover <kbd>Delete</kbd></button>
        <button onClick={handleSetInitial} disabled={!selectedNodeId}>Definir Inicial <kbd>Ctrl+S</kbd></button>
        <button onClick={handleToggleFinal} disabled={!selectedNodeId}>Alternar Final <kbd>Ctrl+F</kbd></button>
        <button onClick={handleRecenter} className="recenter-button">Recentralizar <kbd>Ctrl+R</kbd></button>
        <button onClick={handleImportClick} className="import-button">Importar JSON <kbd>Ctrl+I</kbd></button>
        <button onClick={handleExport} className="export-button">Exportar JSON <kbd>Ctrl+E</kbd></button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
        <div className="instructions">
            <h4>Como Usar</h4>
            <p>• <b>Clique</b> para selecionar.</p>
            <p>• <b>Duplo Clique</b> na transição para editar.</p>
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
        activeNodeId={animationStep?.currentNodeId ?? null}
        activeEdgeId={animationStep?.activeEdgeId ?? null}
        failedNodeId={animationStep?.failed ? animationStep.currentNodeId : null}
      />
    </div>
  );
}

export default App;

