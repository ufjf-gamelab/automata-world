import { type Stage } from "./elements/types";

export type GameState = {
    activeStage: Stage;
    activeButtons: string[];
    playerGridPos: [number, number];
    playerRotation: number;
    blockHeight: number;
    isVictory: boolean;
    commands: string;
    commandIndex: number;
    isExecuting: boolean;
};

export type GameAction =
    | { type: "RESET_STAGE"; payload?: { stage?: Stage; commands?: string } }
    | { type: "UPDATE_COMMANDS"; payload: string }
    | { type: "START_EXECUTION" }
    | { type: "STOP_EXECUTION" }
    | { type: "NEXT_STEP" };

// --- FUNÇÕES AUXILIARES (Puras) ---
const parseGridToHeights = (gridString: string) => {
    return gridString.split("\n").map((row) =>
        row.split("").map((char) => {
            if (char === " ") return 0;
            let val = parseInt(char);
            if (val > 5) val = val - 5;
            if (val === 0) val = 5;
            return val;
        }),
    );
};

const getBlockHeight = (x: number, z: number, heightMatrix: number[][]) => {
    if (z < 0 || z >= heightMatrix.length) return -1;
    if (x < 0 || x >= heightMatrix[z].length) return -1;
    return heightMatrix[z][x];
};

const getRawValue = (x: number, z: number, gridString: string) => {
    const rows = gridString.split("\n");
    if (z < 0 || z >= rows.length) return -1;
    const row = rows[z].split("");
    if (x < 0 || x >= row.length) return -1;
    const char = row[x];
    if (char === " ") return 0;
    return parseInt(char);
};

const countTotalButtons = (gridString: string) => {
    let count = 0;
    const rows = gridString.trim().split("\n");
    rows.forEach((row) => {
        row.split("").forEach((char) => {
            if (char === " ") return;
            const val = parseInt(char);
            if (val === 0 || val > 5) count++;
        });
    });
    return count;
};

// --- INITIAL STATE ---
export const createInitialState = (initialStage: Stage): GameState => {
    const heightMatrix = parseGridToHeights(initialStage.floor);
    const [x, z] = initialStage.playerPosition;
    const h = getBlockHeight(x, z, heightMatrix);

    return {
        activeStage: initialStage,
        activeButtons: [],
        playerGridPos: initialStage.playerPosition,
        playerRotation: 0,
        blockHeight: h === -1 ? 0 : h,
        isVictory: false,
        commands: "",
        commandIndex: 0,
        isExecuting: false,
    };
};

// --- REDUCER (O Cérebro) ---
export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "RESET_STAGE": {
            //
            const stage = action.payload?.stage || state.activeStage;
            // Se commands vier no payload, usa ele. Se for undefined, mantem o atual. Se for string vazia, limpa.
            const newCommands =
                action.payload?.commands !== undefined ? action.payload.commands : state.commands;

            return {
                ...createInitialState(stage),
                commands: newCommands,
            };
        }

        case "UPDATE_COMMANDS": {
            return {
                ...createInitialState(state.activeStage),
                commands: action.payload,
            };
        }

        case "START_EXECUTION":
            return { ...state, isExecuting: true };

        case "STOP_EXECUTION":
            return { ...state, isExecuting: false };

        case "NEXT_STEP": {
            if (state.commandIndex >= state.commands.length) return state;

            const char = state.commands[state.commandIndex].toLowerCase();
            const heightMatrix = parseGridToHeights(state.activeStage.floor);

            let currX = state.playerGridPos[0];
            let currZ = state.playerGridPos[1];
            let currRot = state.playerRotation;
            let currH = state.blockHeight;
            let currActiveButtons = [...state.activeButtons];

            // Lógica de Alvo
            let targetX = currX;
            let targetZ = currZ;

            if (currRot === 0) targetZ += 1;
            else if (currRot === 1) targetX += 1;
            else if (currRot === 2) targetZ -= 1;
            else if (currRot === 3) targetX -= 1;

            const targetH = getBlockHeight(targetX, targetZ, heightMatrix);
            const isTargetValid = targetH !== -1;

            let nextX = currX;
            let nextZ = currZ;
            let nextH = currH;
            let nextRot = currRot;

            switch (char) {
                case "f":
                    if (isTargetValid && (targetH === currH || targetH === currH - 1)) {
                        nextX = targetX;
                        nextZ = targetZ;
                        nextH = targetH;
                    }
                    break;
                case "p":
                    if (isTargetValid && targetH === currH + 1) {
                        nextX = targetX;
                        nextZ = targetZ;
                        nextH = targetH;
                    }
                    break;
                case "t":
                    nextRot = (currRot + 2) % 4;
                    break;
                case "e":
                    nextRot = (currRot + 1) % 4;
                    break;
                case "d":
                    nextRot = (currRot + 3) % 4; // 3 rotações p/ direita = 1 p/ esquerda
                    break;
                case "b": {
                    const rawVal = getRawValue(currX, currZ, state.activeStage.floor);
                    const isButton = rawVal > 5 || rawVal === 0;

                    if (isButton) {
                        const key = `${currX}-${currZ}`;
                        if (currActiveButtons.includes(key)) {
                            currActiveButtons = currActiveButtons.filter((k) => k !== key);
                        } else {
                            currActiveButtons.push(key);
                        }
                    }
                    break;
                }
            }

            // Verifica Vitória
            const nextCommandIndex = state.commandIndex + 1;
            const isTapeFinished = nextCommandIndex >= state.commands.length;
            const totalButtons = countTotalButtons(state.activeStage.floor);
            const isVictory =
                totalButtons > 0 && currActiveButtons.length === totalButtons && isTapeFinished;

            return {
                ...state,
                playerGridPos: [nextX, nextZ],
                playerRotation: nextRot,
                blockHeight: nextH,
                activeButtons: currActiveButtons,
                commandIndex: state.commandIndex + 1,
                isVictory: isVictory,
            };
        }

        default:
            return state;
    }
};
