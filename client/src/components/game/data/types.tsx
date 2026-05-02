export type MapObjectProps = {
    position: [number, number, number];
};

export type TileProps = {
    height: number;
    position: [number, number, number];
    isButton?: boolean;
    isActive?: boolean;
};

export type FloorProps = {
    grid: string;
    activeButtons?: string[];
};

export type StagePermissions = {
    fixedTape?: string;
    maxNodes?: number;
    allowedSymbols?: string[];
    allowedCommands?: string[];
    stateActionsAllowed?: boolean;
    edgeActionsAllowed?: boolean;
    allowLoops?: boolean;
    allowMultipleOutgoing?: boolean;
};

export type GraphNodeData = {
    id: string;
    label: string;
    isInitial?: boolean;
    isFinal?: boolean;
    action?: string;
};

export type GraphEdgeData = {
    source: string;
    target: string;
    label: string;
    action?: string;
};

export type GraphData = {
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
};

/**
 * Um slide do tutorial de uma fase.
 * `image` é opcional — o slide pode ser só texto.
 */
export type TutorialSlide = {
    /** URL da imagem (relativa ao public/ ou externa). Opcional. */
    image?: string;
    /** Texto explicativo exibido abaixo da imagem */
    text: string;
};

export type Stage = {
    id: number;
    name: string;
    floor: string;
    playerPosition: [number, number];
    initialRotation?: number;
    permissions?: StagePermissions;
    initialGraph?: GraphData;
    /**
     * Array de slides exibidos ao entrar na fase pela primeira vez.
     * Cada slide tem uma imagem opcional e um texto obrigatório.
     * Undefined = sem tutorial.
     */
    tutorial?: TutorialSlide[];
};

export type CommandTapeProps = {
    commands: string;
    commandIndex: number;
    isExecuting: boolean;
    onInputChange: (newCommands: string) => void;
    onExecuteStep: () => void;
    onReset: () => void;
    onRetry: () => void;
};

export type VictoryModalProps = {
    isOpen: boolean;
    onNextStage: () => void;
};
