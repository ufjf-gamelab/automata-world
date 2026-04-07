// Trocar aqui para mudar o modo de movimento do jogo:
// "cardinal" → F, P, B, N, S, L, O  (direções absolutas do mapa)
// "relative" → F, P, B, E, D, T     (virar relativo ao jogador)
export type MovementMode = "cardinal" | "relative";
export const MOVEMENT_MODE: MovementMode = "cardinal";

export interface GameCommand {
    key: string;
    label: string;
    description: string;
}

const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", label: "F", description: "Frente" },
    { key: "p", label: "P", description: "Pula" },
    { key: "b", label: "B", description: "Botão" },
    { key: "n", label: "N", description: "Norte" },
    { key: "s", label: "S", description: "Sul" },
    { key: "l", label: "L", description: "Leste" },
    { key: "o", label: "O", description: "Oeste" },
];

const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", label: "F", description: "Frente" },
    { key: "p", label: "P", description: "Pula" },
    { key: "b", label: "B", description: "Botão" },
    { key: "e", label: "E", description: "Esquerda" },
    { key: "d", label: "D", description: "Direita" },
    { key: "t", label: "T", description: "Trás" },
];

export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "cardinal" ? COMMANDS_CARDINAL : COMMANDS_RELATIVE;
