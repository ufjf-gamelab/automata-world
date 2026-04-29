export type MovementMode = "cardinal" | "relative";

/**
 * Define o modo de rotação do jogador.
 *
 * "relative" → girar à esquerda (e), à direita (d) ou meia-volta (t) em relação
 *              à direção atual do boneco. Mais intuitivo para autômatos simples.
 *
 * "cardinal"  → apontar diretamente para Norte (n), Sul (s), Leste (l), Oeste (o).
 *               Útil quando o mapa exige controle absoluto de orientação.
 */
export const MOVEMENT_MODE: MovementMode = "relative";

export interface GameCommand {
    key: string;
    display: string;
    /** Palavra completa usada como identificador de animação no Player */
    word: string;
}

const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", display: "Forward", word: "forward" },
    { key: "p", display: "Jump", word: "jump" },
    { key: "b", display: "Button", word: "button" },
    { key: "e", display: "Turn Left ↺", word: "turnLeft" },
    { key: "d", display: "Turn Right ↻", word: "turnRight" },
    { key: "t", display: "Turn Back ↩", word: "turnBack" },
];

const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", display: "Forward", word: "forward" },
    { key: "p", display: "Jump", word: "jump" },
    { key: "b", display: "Button", word: "button" },
    { key: "n", display: "North", word: "north" },
    { key: "s", display: "South", word: "south" },
    { key: "l", display: "East", word: "east" },
    { key: "o", display: "West", word: "west" },
];

export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "relative" ? COMMANDS_RELATIVE : COMMANDS_CARDINAL;

/** Converte char interno (ex: "e") para palavra de animação (ex: "turnLeft") */
export const CHAR_TO_COMMAND: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.word]),
);

/** Converte palavra de animação de volta para char interno */
export const COMMAND_TO_CHAR: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.word, c.key]),
);
