import { useState, useReducer, useRef } from "react";
import type { Dispatch } from "react";
import GraphCanvas from "./canvas/GraphCanvas";
import SimulationPanel, { SPEED_PRESETS } from "./ui/SimulationPanel";
import TransitionModal from "./ui/TransitionModal";
import NodeActionModal from "./ui/NodeActionModal";
import ControlPanel from "./ui/ControlPanel";
import ContextMenu, { MenuItem } from "./ui/ContextMenu";
import StageRestrictionsInfo from "./ui/StageRestrictionsInfo";
import styles from "./AutomatonEditor.module.css";
import { graphReducer } from "./AutomatonReducer";
import { useSimulation } from "./useSimulation";
import { useGraphActions } from "./useGraphActions";
import {
    createInitialGraphFromStage,
    type ContextMenuData,
    type EdgeMenuData,
    type LinkingState,
    type ModalData,
    type AutomatonEditorProps,
} from "./AutomatonEditorTypes";
import type { GameAction } from "../game/gameReducer";

export type { Node, Edge } from "./AutomatonReducer";
export { NODE_WIDTH, NODE_HEIGHT } from "./AutomatonReducer";
export type { AutomatonEditorProps } from "./AutomatonEditorTypes";

interface Props extends AutomatonEditorProps {
    gameDispatch: Dispatch<GameAction>;
    setCurrentCommand: (cmd: string) => void;
}

function AutomatonEditor({
    gameDispatch,
    setCurrentCommand,
    activeStage,
    onStartTransition,
    onEndTransition,
    onStateEnter,
    onStateExit,
}: Props) {
    const [graph, dispatch] = useReducer(graphReducer, activeStage, createInitialGraphFromStage);
    const { nodes, edges } = graph;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [recenterTrigger, setRecenterTrigger] = useState(1);
    const [isSimPanelOpen, setSimPanelOpen] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState<number>(SPEED_PRESETS[1].value);

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

    const { permissions } = activeStage;
    const nodeLimitReached =
        permissions?.maxNodes !== undefined && nodes.length >= permissions.maxNodes;

    const handleRelayout = () => {
        dispatch({ type: "RELAYOUT" });
        setRecenterTrigger((c) => c + 1);
    };

    const handleCenter = () => setRecenterTrigger((c) => c + 1);

    const simulation = useSimulation({
        nodes,
        edges,
        gameDispatch,
        setCurrentCommand,
        simulationSpeed,
        onStartTransition,
        onEndTransition,
        onStateEnter,
        onStateExit,
    });

    const graphActions = useGraphActions({
        graph,
        nodes,
        edges,
        dispatch,
        contextMenu,
        edgeMenu,
        modalData,
        permissions,
        menuRef,
        fileInputRef,
        setRecenterTrigger,
        setContextMenu,
        setEdgeMenu,
        setLinkingState,
        setMousePosition,
        setModalData,
    });

    const nodeMenuItems: MenuItem[] = [
        {
            icon: "✨",
            label: "Add & Link New State",
            onClick: graphActions.handleAddNewStateAndLink,
            disabled: nodeLimitReached,
        },
        { icon: "🔗", label: "Link to Existing State", onClick: graphActions.handleStartLinking },
        { isSeparator: true },
        { icon: "🚩", label: "Set as Initial State", onClick: graphActions.handleSetInitialState },
        { icon: "🔘", label: "Toggle Final State", onClick: graphActions.handleToggleFinalState },
        ...(permissions?.stateActionsAllowed !== false
            ? [{ icon: "⚡", label: "Set State Action", onClick: graphActions.handleSetNodeAction }]
            : []),
        { isSeparator: true },
        {
            icon: "🗑️",
            label: "Delete State",
            onClick: graphActions.handleDeleteNode,
            className: "text-red-600",
        },
    ];

    const edgeMenuItems: MenuItem[] = [
        { icon: "✏️", label: "Edit Transition", onClick: graphActions.handleOpenEditEdgeModal },
        {
            icon: "🗑️",
            label: "Delete Transition",
            onClick: graphActions.handleDeleteEdge,
            className: "text-red-600",
        },
    ];

    const closeModal = () => setModalData({ isOpen: false, action: null, title: "" });

    const activeCharIndex = simulation.step?.characterIndex ?? -1;

    return (
        <div className={styles.automatonSection}>
            {/*
             * SimulationPanel é irmão do canvasWrapper — fica fora do overflow:hidden.
             * No desktop: position:absolute sobre o canvas via CSS.
             * No mobile:  aparece no fluxo normal (column-reverse coloca embaixo do canvas).
             */}
            <SimulationPanel
                isSimPanelOpen={isSimPanelOpen}
                setSimPanelOpen={setSimPanelOpen}
                inputWord={simulation.inputWord}
                setInputWord={simulation.setInputWord}
                animationStatus={simulation.status}
                activeCharIndex={activeCharIndex}
                handlePlayAnimation={simulation.play}
                handleStopAnimation={simulation.stop}
                getStatusMessage={simulation.getStatusMessage}
                permissions={permissions}
                simulationSpeed={simulationSpeed}
                onSpeedChange={setSimulationSpeed}
            />

            <div className={styles.canvasWrapper} onClick={graphActions.handleSvgClick}>
                <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodeDrag={graphActions.handleNodeDrag}
                    onNodeClick={graphActions.handleNodeClick}
                    onNodeLongPress={graphActions.handleNodeLongPress}
                    onEdgeClick={graphActions.handleEdgeClick}
                    onSvgMouseMove={graphActions.handleSvgMouseMove}
                    recenterTrigger={recenterTrigger}
                    linkingState={linkingState}
                    mousePosition={mousePosition}
                    sourceNodeForLinking={linkingState.sourceNode}
                    activeNodeId={simulation.step?.currentNodeId ?? null}
                    activeEdgeId={simulation.step?.activeEdgeId ?? null}
                    failedNodeId={simulation.step?.failed ? simulation.step.currentNodeId : null}
                    isSimulating={simulation.status === "running"}
                    activeStepIndex={simulation.step?.characterIndex ?? 0}
                />

                <ControlPanel
                    onRelayout={handleRelayout}
                    onCenter={handleCenter}
                    onImportClick={graphActions.handleImportClick}
                    onExport={graphActions.handleExport}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={graphActions.handleFileChange}
                    accept=".json"
                    style={{ display: "none" }}
                />

                {permissions && Object.keys(permissions).length > 0 && (
                    <StageRestrictionsInfo permissions={permissions} stageName={activeStage.name} />
                )}

                <TransitionModal
                    isOpen={modalData.isOpen && modalData.action !== "nodeAction"}
                    onClose={closeModal}
                    onSubmit={graphActions.handleModalSubmit}
                    initialLabel={modalData.action === "edit" ? modalData.edgeToEdit?.label : ""}
                    initialAction={modalData.action === "edit" ? modalData.edgeToEdit?.action : ""}
                    title={modalData.title}
                    allowedSymbols={permissions?.allowedSymbols}
                    allowedCommands={permissions?.allowedCommands}
                    edgeActionsAllowed={permissions?.edgeActionsAllowed}
                />

                <NodeActionModal
                    isOpen={modalData.isOpen && modalData.action === "nodeAction"}
                    onClose={closeModal}
                    onSubmit={graphActions.handleNodeActionSubmit}
                    initialAction={modalData.nodeForAction?.action}
                    title={modalData.title}
                    allowedCommands={permissions?.allowedCommands}
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
