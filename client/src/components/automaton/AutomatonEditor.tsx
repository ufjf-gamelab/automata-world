import { useState, useReducer, useRef } from "react";
import type { Dispatch } from "react";
import GraphCanvas from "./canvas/GraphCanvas";
import SimulationPanel from "./ui/SimulationPanel";
import TransitionModal from "./ui/TransitionModal";
import NodeActionModal from "./ui/NodeActionModal";
import ControlPanel from "./ui/ControlPanel";
import ContextMenu, { MenuItem } from "./ui/ContextMenu";
import styles from "./AutomatonEditor.module.css";
import { graphReducer } from "./AutomatonReducer";
import { useSimulation } from "./useSimulation";
import { useGraphActions } from "./useGraphActions";
import {
    initialGraphState,
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

    const { permissions } = activeStage;
    const nodeLimitReached =
        permissions?.maxNodes !== undefined && nodes.length >= permissions.maxNodes;

    const simulation = useSimulation({
        nodes,
        edges,
        gameDispatch,
        setCurrentCommand,
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

    return (
        <div className={styles.automatonSection}>
            <SimulationPanel
                isSimPanelOpen={isSimPanelOpen}
                setSimPanelOpen={setSimPanelOpen}
                inputWord={simulation.inputWord}
                setInputWord={simulation.setInputWord}
                animationStatus={simulation.status}
                handlePlayAnimation={simulation.play}
                handleStopAnimation={simulation.stop}
                getStatusMessage={simulation.getStatusMessage}
                permissions={permissions}
            />

            <div className={styles.canvasWrapper} onClick={graphActions.handleSvgClick}>
                <ControlPanel
                    onRelayout={graphActions.handleRelayout}
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
                />

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
