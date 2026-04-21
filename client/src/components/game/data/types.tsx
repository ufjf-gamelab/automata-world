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
};

export type Stage = {
    id: number;
    name: string;
    floor: string;
    playerPosition: [number, number];
    permissions?: StagePermissions;
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
