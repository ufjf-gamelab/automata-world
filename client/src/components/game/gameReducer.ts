/**
 * gameReducer.ts — Estado e lógica de movimento do jogo 3D
 *
 * Contém toda a mecânica do jogo: como o personagem se move, sobe, desce,
 * pressiona botões e como a vitória é detectada.
 *
 * O mapa é representado como uma string de caracteres onde:
 *   1-5  → tile normal com altura correspondente
 *   6-9  → tile de botão com altura (valor - 5)
 *   0    → botão com altura 5
 *   -    → espaço vazio (sem tile)
 *   ' '  → espaço (sem tile)
 *
 * As direções de rotação seguem o índice:
 *   0 = Sul (+Z), 1 = Leste (+X), 2 = Norte (-Z), 3 = Oeste (-X)
 */
import { type Stage } from "./data/types";
import { MOVEMENT_MODE } from "./gameConfig";

// --- Tipos ---

export type GameState = {
    activeStage: Stage;
    activeButtons: string[]; // conjunto de chaves "x-z" dos botões ativados
    playerGridPos: [number, number]; // posição do jogador na grade (coluna, linha)
    playerRotation: number; // direção para onde o jogador está virado (0-3)
    blockHeight: number; // altura do tile onde o jogador está
    isVictory: boolean;
    commands: string; // sequência de comandos carregada (não usada na simulação do autômato)
    commandIndex: number;
    isExecuting: boolean;
    stepCounter: number; // incrementado a cada ação executada — sinaliza ao Player para tocar animação
};

export type GameAction =
    | { type: "RESET_STAGE"; payload?: { stage?: Stage; commands?: string } }
    | { type: "UPDATE_COMMANDS"; payload: string }
    | { type: "START_EXECUTION" }
    | { type: "STOP_EXECUTION" }
    | { type: "NEXT_STEP" }
    | { type: "EXECUTE_ACTION"; payload: string }; // executa sequência de comandos diretamente (ex: "fn")

// --- Constantes de direção ---

/** Vetor de deslocamento para cada índice de rotação */
const DIRECTIONS: [number, number][] = [
    [0, 1], // 0 = Sul
    [1, 0], // 1 = Leste
    [0, -1], // 2 = Norte
    [-1, 0], // 3 = Oeste
];

/** Mapeamento de letra para índice de rotação no modo cardinal */
const CARDINAL_MAP: Record<string, number> = { s: 0, l: 1, n: 2, o: 3 };

// --- Funções auxiliares (puras, sem efeitos colaterais) ---

/**
 * Converte a string do mapa em uma matriz de alturas numéricas.
 * Botões (6-9, 0) têm sua altura extraída removendo o offset de 5.
 */
const parseGridToHeights = (gridString: string) =>
    gridString.split("\n").map((row) =>
        row.split("").map((char) => {
            if (char === " ") return 0;
            let val = parseInt(char);
            if (val > 5) val = val - 5; // botão: remove o offset para obter a altura real
            if (val === 0) val = 5; // botão com valor 0 representa altura 5
            return val;
        }),
    );

/** Retorna a altura do tile na posição (x, z), ou -1 se estiver fora dos limites */
const getBlockHeight = (x: number, z: number, heightMatrix: number[][]) => {
    if (z < 0 || z >= heightMatrix.length) return -1;
    if (x < 0 || x >= heightMatrix[z].length) return -1;
    return heightMatrix[z][x];
};

/** Retorna o valor bruto do caractere na posição (x, z), preservando o offset dos botões */
const getRawValue = (x: number, z: number, gridString: string) => {
    const rows = gridString.split("\n");
    if (z < 0 || z >= rows.length) return -1;
    const row = rows[z].split("");
    if (x < 0 || x >= row.length) return -1;
    const char = row[x];
    if (char === " ") return 0;
    return parseInt(char);
};

/** Conta quantos botões existem no mapa (para verificar condição de vitória) */
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

/**
 * Aplica um único comando ao estado atual do jogo e retorna apenas
 * os campos que foram alterados (posição, rotação, altura, botões).
 *
 * Esta função é pura: não modifica o estado original, apenas retorna as mudanças.
 * Compartilhada entre NEXT_STEP e EXECUTE_ACTION para evitar duplicação.
 */
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

    // Calcula o tile alvo (à frente do jogador)
    const [dx, dz] = DIRECTIONS[currRot];
    const targetX = currX + dx;
    const targetZ = currZ + dz;
    const targetH = getBlockHeight(targetX, targetZ, heightMatrix);
    // O tile alvo é válido apenas se tiver altura > 0 (existe e não é vazio)
    const isTargetValid = targetH > 0;

    let nextX = currX,
        nextZ = currZ,
        nextH = currH,
        nextRot = currRot;

    switch (char) {
        // Mover para frente: permitido se o tile alvo tem mesma altura ou é 1 abaixo
        case "f":
            if (isTargetValid && (targetH === currH || targetH === currH - 1)) {
                nextX = targetX;
                nextZ = targetZ;
                nextH = targetH;
            }
            break;

        // Pular: só sobe um nível (targetH === currH + 1)
        case "p":
            if (isTargetValid && targetH === currH + 1) {
                nextX = targetX;
                nextZ = targetZ;
                nextH = targetH;
            }
            break;

        // Pressionar botão: comportamento difere entre os modos de movimento
        case "b": {
            // if (MOVEMENT_MODE === "relative") {

                // Modo relativo: ativa o botão sob o próprio jogador sem se mover
                const rawCurr = getRawValue(currX, currZ, state.activeStage.floor);
                const isCurrentButton = rawCurr > 5 || rawCurr === 0;
                if (isCurrentButton) {
                    const key = `${currX}-${currZ}`;
                    currActiveButtons = currActiveButtons.includes(key)
                        ? currActiveButtons.filter((k) => k !== key)
                        : [...currActiveButtons, key];
                }
            // }
            //  else {
            //     // Modo cardinal: move para o botão à frente e o ativa
            //     const rawVal = getRawValue(targetX, targetZ, state.activeStage.floor);
            //     const isFrontButton = rawVal > 5 || rawVal === 0;
            //     if (isFrontButton && isTargetValid && targetH === currH) {
            //         nextX = targetX;
            //         nextZ = targetZ;
            //         nextH = targetH;
            //         const key = `${targetX}-${targetZ}`;
            //         currActiveButtons = currActiveButtons.includes(key)
            //             ? currActiveButtons.filter((k) => k !== key)
            //             : [...currActiveButtons, key];
            //     }
            // }
            break;
        }

        // Rotações cardinais (modo "cardinal"): setam a direção absoluta
        case "n":
        case "s":
        case "l":
        case "o":
            if (MOVEMENT_MODE === "cardinal") nextRot = CARDINAL_MAP[char];
            break;

        // Rotações relativas (modo "relative"): giram em relação à direção atual
        case "e":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 1) % 4;
            break; // esquerda
        case "d":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 3) % 4;
            break; // direita
        case "t":
            if (MOVEMENT_MODE === "relative") nextRot = (currRot + 2) % 4;
            break; // trás
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
        playerRotation: 0, // começa olhando para Sul
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
            // O payload pode ser uma única letra ("f") ou uma sequência ("fnb").
            // Cada caractere é aplicado em cadeia: a saída de um é a entrada do próximo.
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
