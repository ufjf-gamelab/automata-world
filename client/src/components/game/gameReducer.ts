import { type Stage } from "./data/types";
import { MOVEMENT_MODE } from "./gameConfig";

// --- Tipos ---

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
    stepCounter: number;
};

export type GameAction =
    | { type: "RESET_STAGE"; payload?: { stage?: Stage; commands?: string } }
    | { type: "UPDATE_COMMANDS"; payload: string }
    | { type: "START_EXECUTION" }
    | { type: "STOP_EXECUTION" }
    | { type: "NEXT_STEP" }
    | { type: "EXECUTE_ACTION"; payload: string };

// --- Constantes de direção ---

const DIRECTIONS: [number, number][] = [
    [0, 1],  // 0 = Sul
    [1, 0],  // 1 = Leste
    [0, -1], // 2 = Norte
    [-1, 0], // 3 = Oeste
];

const CARDINAL_MAP: Record<string, number> = { s: 0, l: 1, n: 2, o: 3 };

// --- Funções auxiliares ---

const parseGridToHeights = (gridString: string) =>
    gridString.split("\n").map((row) =>
        row.split("").map((char) => {
            if (char === " ") return 0;
            let val = parseInt(char);
            if (val > 5) val = val - 5;
            if (val === 0) val = 5;
            return val;
        }),
    );

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
    gridString
        .trim()
        .split("\n")
        .forEach((row) =>
            row.split("").forEach((char) => {
                if (char === " ") return;
                const val = parseInt(char);
                if (val === 0 || val > 5) count++;
            }),
        );
    return count;
};

const applyCommand = (
    char: string,
    state: GameState,
): Pick<GameState, "playerGridPos" | "playerRotation" | "blockHeight" | "activeButtons"> => {
    const heightMatrix = parseGridToHeights(state.activeStage.floor);
    const currX = state.playerGridPos[0];
    const currZ = state.playerGridPos[1];
    let currRot = state.playerRotation;
    const currH = state.blockHeight;
    let currActiveButtons = [...state.activeButtons];

    const [dx, dz] = DIRECTIONS[currRot];
    const targetX = currX + dx;
    const targetZ = currZ + dz;
    const targetH = getBlockHeight(targetX, targetZ, heightMatrix);
    const isTargetValid = targetH > 0;

    let nextX = currX, nextZ = currZ, nextH = currH, nextRot = currRot;

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

        case "b": {
            const rawCurr = getRawValue(currX, currZ, state.activeStage.floor);
            const isCurrentButton = rawCurr > 5 || rawCurr === 0;
            if (isCurrentButton) {
                const key = `${currX}-${currZ}`;
                currActiveButtons = currActiveButtons.includes(key)
                    ? currActiveButtons.filter((k) => k !== key)
                    : [...currActiveButtons, key];
            }
            break;
        }

        case "n":
        case "s":
        case "l":
        case "o":
            if (MOVEMENT_MODE === "cardinal") nextRot = CARDINAL_MAP[char];
            break;

        case "e":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 1) % 4;
            break;
        case "d":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 3) % 4;
            break;
        case "t":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 2) % 4;
            break;
    }

    return {
        playerGridPos: [nextX, nextZ],
        playerRotation: nextRot,
        blockHeight: nextH,
        activeButtons: currActiveButtons,
    };
};

// --- Estado inicial ---

export const createInitialState = (initialStage: Stage): GameState => {
    const heightMatrix = parseGridToHeights(initialStage.floor);
    const [x, z] = initialStage.playerPosition;
    const h = getBlockHeight(x, z, heightMatrix);
    return {
        activeStage: initialStage,
        activeButtons: [],
        playerGridPos: initialStage.playerPosition,
        // Usa a direção inicial definida pela fase; padrão = 0 (Sul)
        playerRotation: initialStage.initialRotation ?? 0,
        blockHeight: h === -1 ? 0 : h,
        isVictory: false,
        commands: "",
        commandIndex: 0,
        isExecuting: false,
        stepCounter: 0,
    };
};

// --- Reducer ---

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "RESET_STAGE": {
            const stage = action.payload?.stage || state.activeStage;
            const newCommands =
                action.payload?.commands !== undefined ? action.payload.commands : state.commands;
            return { ...createInitialState(stage), commands: newCommands };
        }

        case "UPDATE_COMMANDS":
            return { ...createInitialState(state.activeStage), commands: action.payload };

        case "START_EXECUTION":
            return { ...state, isExecuting: true };

        case "STOP_EXECUTION":
            return { ...state, isExecuting: false };

        case "NEXT_STEP": {
            if (state.commandIndex >= state.commands.length) return state;
            const char = state.commands[state.commandIndex].toLowerCase();
            const nextCommandIndex = state.commandIndex + 1;
            const applied = applyCommand(char, state);
            const isTapeFinished = nextCommandIndex >= state.commands.length;
            const totalButtons = countTotalButtons(state.activeStage.floor);
            const isVictory =
                totalButtons > 0 && applied.activeButtons.length === totalButtons && isTapeFinished;
            return {
                ...state,
                ...applied,
                commandIndex: nextCommandIndex,
                stepCounter: state.stepCounter + 1,
                isVictory,
            };
        }

        case "EXECUTE_ACTION": {
            let current = state;
            for (const ch of action.payload.toLowerCase()) {
                const applied = applyCommand(ch, current);
                current = { ...current, ...applied };
            }
            const totalButtons = countTotalButtons(state.activeStage.floor);
            const isVictory = totalButtons > 0 && current.activeButtons.length === totalButtons;
            return { ...state, ...current, stepCounter: state.stepCounter + 1, isVictory };
        }

        default:
            return state;
    }
};