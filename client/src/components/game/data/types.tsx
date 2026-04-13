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

export type Stage = {
    id: number;
    name: string;
    floor: string;
    playerPosition: [number, number];
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