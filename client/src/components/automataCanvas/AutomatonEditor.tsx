import { useState, useCallback, useEffect, useRef, useReducer } from "react";
import GraphCanvas from "./GraphCanvas";
import SimulationPanel from "./SimulationPanel";
import TransitionModal from "./TransitionModal";
import ControlPanel from "./ControlPanel";
import ContextMenu, { MenuItem } from "./ContextMenu";
import GameView from "../GameView";
import styles from "./AutomatonEditor.module.css";
import { graphReducer } from "./Automatonreducer";
import { gameReducer, createInitialState } from "../game/gameReducer";
import { stagesList } from "../game/Stages";
import type { Stage } from "../game/types";
import {
    initialGraphState,
    type AnimationStatus,
    type AnimationStep,
    type ContextMenuData,
    type EdgeMenuData,
    type LinkingState,
    type ModalData,
    type AutomatonEditorProps,
} from "./AutomatonEditorTypes";
import { useGraphActions } from "./Usegraphactions";

export type { Node, Edge } from "./Automatonreducer";
export { NODE_WIDTH, NODE_HEIGHT } from "./Automatonreducer";
export type { AutomatonEditorProps } from "./AutomatonEditorTypes";

function AutomatonEditor({
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: AutomatonEditorProps = {}) {
    // --- Estado do autômato ---
    const [graph, dispatch] = useReducer(graphReducer, initialGraphState);
    const { nodes, edges } = graph;

    // --- Estado do jogo (controlado pelo autômato) ---
    const [gameState, gameDispatch] = useReducer(gameReducer, stagesList[0], createInitialState);

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
    const [currentCommand, setCurrentCommand] = useState("");
    const animationTimeoutRef = useRef<number | null>(null);

    // Refs para os callbacks evitam closures stale no useEffect da simulação
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

    const actions = useGraphActions({
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
    });

    // --- Loop de simulação ---
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

                // Avança o jogo um passo com o símbolo da transição
                gameDispatch({ type: "NEXT_STEP" });
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

        // Carrega a palavra como sequência de comandos do jogo e reinicia o mapa
        gameDispatch({ type: "UPDATE_COMMANDS", payload: inputWord.toLowerCase() });

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
        gameDispatch({ type: "RESET_STAGE", payload: { commands: "" } });
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

    // --- Handlers do jogo ---
    const handleChangeStage = (stage: Stage) => {
        gameDispatch({ type: "RESET_STAGE", payload: { stage, commands: "" } });
        handleStopAnimation();
    };

    const handleNextStage = () => {
        const currentIndex = stagesList.findIndex((s) => s.id === gameState.activeStage.id);
        const nextStage = stagesList[currentIndex + 1] || stagesList[0];
        gameDispatch({ type: "RESET_STAGE", payload: { stage: nextStage, commands: "" } });
    };

    const nodeMenuItems: MenuItem[] = [
        {
            icon: "✨",
            label: "Adic. e Ligar Novo Estado",
            onClick: actions.handleAddNewStateAndLink,
        },
        { icon: "🔗", label: "Ligar a Estado Existente", onClick: actions.handleStartLinking },
        { isSeparator: true },
        {
            icon: "🚩",
            label: "Definir como Estado Inicial",
            onClick: actions.handleSetInitialState,
        },
        { icon: "🔘", label: "Alternar Estado Final", onClick: actions.handleToggleFinalState },
        { isSeparator: true },
        {
            icon: "🗑️",
            label: "Excluir Estado",
            onClick: actions.handleDeleteNode,
            className: "text-red-600",
        },
    ];

    const edgeMenuItems: MenuItem[] = [
        { icon: "✏️", label: "Editar Símbolo", onClick: actions.handleOpenEditEdgeModal },
        {
            icon: "🗑️",
            label: "Excluir Transição",
            onClick: actions.handleDeleteEdge,
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

                <div className={styles.canvasWrapper} onClick={actions.handleSvgClick}>
                    <ControlPanel
                        onRelayout={actions.handleRelayout}
                        onImportClick={actions.handleImportClick}
                        onExport={actions.handleExport}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={actions.handleFileChange}
                        accept=".json"
                        style={{ display: "none" }}
                    />

                    <GraphCanvas
                        nodes={nodes}
                        edges={edges}
                        onNodeDrag={actions.handleNodeDrag}
                        onNodeClick={actions.handleNodeClick}
                        onNodeLongPress={actions.handleNodeLongPress}
                        onEdgeClick={actions.handleEdgeClick}
                        onSvgMouseMove={actions.handleSvgMouseMove}
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
                        onSubmit={actions.handleModalSubmit}
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
                <GameView
                    gameState={gameState}
                    currentCommand={currentCommand}
                    onChangeStage={handleChangeStage}
                    onNextStage={handleNextStage}
                />
            </div>
        </div>
    );
}

export default AutomatonEditor;
