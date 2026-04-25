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

/**
 * Restrições de usabilidade que uma fase pode impor ao editor de autômatos.
 * Campos ausentes = sem restrição para aquele aspecto.
 */
export type StagePermissions = {
    /** Fita de entrada pré-definida; o usuário não pode alterá-la */
    fixedTape?: string;
    /** Número máximo de estados permitidos no autômato */
    maxNodes?: number;
    /** Símbolos permitidos nas transições (ex: ["f", "n"]) */
    allowedSymbols?: string[];
    /** Comandos do jogo disponíveis nos modais (ex: ["f", "b"]) */
    allowedCommands?: string[];
    /** false = opção de ação em estados desabilitada */
    stateActionsAllowed?: boolean;
    /** false = opção de ação nas transições desabilitada */
    edgeActionsAllowed?: boolean;
    /** false = não é permitido criar self-loops (aresta de um estado para ele mesmo) */
    allowLoops?: boolean;
    /**
     * false = cada estado pode ter no máximo uma aresta saindo dele.
     * Útil para forçar autômatos determinísticos simples.
     */
    allowMultipleOutgoing?: boolean;
};

/** Estrutura mínima de um nó para definição do grafo inicial da fase */
export type GraphNodeData = {
    id: string;
    label: string;
    isInitial?: boolean;
    isFinal?: boolean;
    action?: string;
};

/** Estrutura mínima de uma aresta para definição do grafo inicial da fase */
export type GraphEdgeData = {
    source: string;
    target: string;
    label: string;
    action?: string;
};

/**
 * Grafo inicial do autômato exibido ao entrar na fase.
 * undefined = grafo vazio (nenhum estado, nenhuma transição).
 */
export type GraphData = {
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
};

export type Stage = {
    id: number;
    name: string;
    floor: string;
    playerPosition: [number, number];
    /**
     * Direção inicial do jogador ao entrar na fase.
     * 0 = Sul, 1 = Leste, 2 = Norte, 3 = Oeste
     * undefined = padrão (0 = Sul)
     */
    initialRotation?: number;
    permissions?: StagePermissions;
    /** Grafo carregado ao entrar na fase; undefined = começa vazio */
    initialGraph?: GraphData;
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
