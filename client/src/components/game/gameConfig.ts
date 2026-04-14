/**
 * gameConfig.ts — Configuração central do modo de movimento do jogo
 *
 * Para trocar o modo de movimento, basta alterar MOVEMENT_MODE aqui.
 * O gameReducer e os modais lêem esta constante automaticamente.
 *
 * Modos disponíveis:
 *   "cardinal" → rotações absolutas (N, S, L, O) — o jogador sempre sabe para onde é Norte
 *   "relative" → rotações relativas (Esquerda, Direita, Trás) — como um robô que vira em relação a si mesmo
 */
export type MovementMode = "cardinal" | "relative";
export const MOVEMENT_MODE: MovementMode = "cardinal";

/**
 * Descritor de um comando do jogo.
 *   key     → letra enviada ao gameReducer (ex: "f")
 *   display → nome exibido nos modais e nos labels das arestas (ex: "Forward")
 */
export interface GameCommand {
    key: string;
    display: string;
}

/** Comandos disponíveis no modo cardinal (direções absolutas do mapa) */
const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", display: "Forward" },
    { key: "p", display: "Jump" },
    { key: "b", display: "Button" },
    { key: "n", display: "North" },
    { key: "s", display: "South" },
    { key: "l", display: "East" },
    { key: "o", display: "West" },
];

/** Comandos disponíveis no modo relativo (virar em relação ao jogador) */
const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", display: "Forward" },
    { key: "p", display: "Jump" },
    { key: "b", display: "Button" },
    { key: "e", display: "Turn Left" },
    { key: "d", display: "Turn Right" },
    { key: "t", display: "Turn Back" },
];

/** Lista de comandos ativos — muda automaticamente com MOVEMENT_MODE */
export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "cardinal" ? COMMANDS_CARDINAL : COMMANDS_RELATIVE;
